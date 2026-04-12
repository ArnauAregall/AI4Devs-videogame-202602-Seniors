import Phaser from 'phaser';
import { GameConfig } from '../config/GameConfig';
import {
  ASSET_KEY_PLAYER_IDLE,
  ASSET_KEY_PLAYER_WALK,
  ASSET_KEY_PLAYER_JUMP,
  ASSET_KEY_PLAYER_JAB,
  ASSET_KEY_PLAYER_KICK,
  ASSET_KEY_PLAYER_JUMP_KICK,
  ASSET_KEY_PLAYER_DIVE_KICK,
  ASSET_KEY_PLAYER_HURT,
  ASSET_KEY_PLAYER_KNOCKDOWN,
  ASSET_KEY_PLAYER_GETUP,
  ASSET_KEY_PLAYER_GRAB,
  ASSET_KEY_PLAYER_SPECIAL,
} from '../assets/AssetKeys';
import { PlayerState } from './PlayerState';
import { PlayerStateMachine } from './PlayerStateMachine';
import { InputManager } from '../input/InputManager';
import type { InputState } from '../input/InputState';

// ── Hitbox dimensions per attack state (px, no magic numbers) ────────────────
const HITBOX: Record<string, { w: number; h: number; offsetX: number; offsetY: number }> = {
  [PlayerState.LightAttack]:  { w: 30, h: 20, offsetX: 30, offsetY: -8 },
  [PlayerState.HeavyAttack]:  { w: 42, h: 30, offsetX: 32, offsetY: -4 },
  [PlayerState.JumpAttack]:   { w: 36, h: 28, offsetX: 24, offsetY: -16 },
  [PlayerState.Grab]:         { w: 24, h: 24, offsetX: 20, offsetY: -8 },
  [PlayerState.SpecialAttack]: { w: 60, h: 50, offsetX: 0,  offsetY: -16 },
};

const ATTACK_STATES: ReadonlySet<PlayerState> = new Set([
  PlayerState.LightAttack,
  PlayerState.HeavyAttack,
  PlayerState.JumpAttack,
  PlayerState.Grab,
  PlayerState.SpecialAttack,
]);

/** One-shot states that auto-transition to Idle when their animation ends. */
const AUTO_TRANSITION_TO_IDLE: ReadonlySet<PlayerState> = new Set([
  PlayerState.LightAttack,
  PlayerState.HeavyAttack,
  PlayerState.JumpAttack,
  PlayerState.Grab,
  PlayerState.Hurt,
  PlayerState.GetUp,
  PlayerState.SpecialAttack,
]);

/** Jump physics: initial upward velocity (px/tick). */
const JUMP_INITIAL_VY = -(GameConfig.JUMP_VELOCITY / GameConfig.TARGET_FPS);
/** Jump gravity per tick (px/tick²), symmetric arc ≈ 60 ticks total airtime. */
const JUMP_GRAVITY_PER_TICK = -JUMP_INITIAL_VY / 30;

/** Animation key → asset key mapping. */
const STATE_TO_ANIM_KEY: Readonly<Record<PlayerState, string>> = {
  [PlayerState.Idle]:          ASSET_KEY_PLAYER_IDLE,
  [PlayerState.Walk]:          ASSET_KEY_PLAYER_WALK,
  [PlayerState.Jump]:          ASSET_KEY_PLAYER_JUMP,
  [PlayerState.LightAttack]:   ASSET_KEY_PLAYER_JAB,
  [PlayerState.HeavyAttack]:   ASSET_KEY_PLAYER_KICK,
  [PlayerState.JumpAttack]:    ASSET_KEY_PLAYER_JUMP_KICK,
  [PlayerState.Grab]:          ASSET_KEY_PLAYER_GRAB,
  [PlayerState.Hurt]:          ASSET_KEY_PLAYER_HURT,
  [PlayerState.Knockdown]:     ASSET_KEY_PLAYER_KNOCKDOWN,
  [PlayerState.GetUp]:         ASSET_KEY_PLAYER_GETUP,
  [PlayerState.SpecialAttack]: ASSET_KEY_PLAYER_DIVE_KICK,
};

/** Minimal combat bus interface. Injected at construction; null in unit tests. */
export interface CombatBus {
  dispatchAreaDamage(source: PlayerController, radius: number): void;
}

/**
 * Owns the player sprite, state machine, health, lives, iFrames, and
 * hitbox lifecycle. Registers itself with {@link GameScene.registerFixedUpdate}
 * and processes one fixed tick at a time.
 *
 * @spec player-controller, player-health, player-movement, player-special-attack
 * @implements FR-PL-01 through FR-PL-22
 */
export class PlayerController {
  // ── Public state (readable by HUD and combat system) ─────────────────────
  /** @spec player-health – FR-PL-14 */
  hp: number;
  /** @spec player-health – FR-PL-14 */
  readonly maxHp: number;
  /** @spec player-health – FR-PL-16 */
  lives: number;
  /** Countdown ticks of invincibility remaining. @spec player-health – FR-PL-18 */
  iFramesRemaining: number = 0;
  /** Countdown ticks until special attack is usable again. @spec player-special-attack – FR-PL-22 */
  specialCooldownTicks: number = 0;
  /** Whether the player is currently facing right. */
  facingRight: boolean = true;

  /** The physics sprite managed by this controller. */
  readonly sprite: Phaser.Physics.Arcade.Sprite;

  // ── Private ───────────────────────────────────────────────────────────────
  private readonly _scene: GameSceneRef;
  private readonly _stateMachine: PlayerStateMachine;
  private readonly _inputManager: InputManager;
  private readonly _combatBus: CombatBus | null;
  private readonly _fixedUpdateBound: (dt: number) => void;

  /** Active hitbox rectangle, or null when not in an attack state. */
  private _hitbox: Phaser.GameObjects.Rectangle | null = null;

  /** Ground-plane y position (depth axis); distinct from jump arc offset. */
  private _baseY: number;
  /** Current vertical velocity for the jump arc (px/tick). */
  private _jumpVelocityY: number = 0;
  /** Jump-arc offset applied on top of _baseY (negative = higher on screen). */
  private _jumpOffsetY: number = 0;

  /**
   * @param scene     The active GameScene instance.
   * @param x         Initial x position.
   * @param y         Initial y position (ground-plane depth).
   * @param combatBus Area-damage dispatcher; pass `null` in unit tests.
   *
   * @spec player-controller – Requirement: PlayerController registers with GameScene fixed-timestep hook
   */
  constructor(
    scene: GameSceneRef,
    x: number,
    y: number,
    combatBus: CombatBus | null = null,
  ) {
    this._scene     = scene;
    this._combatBus = combatBus;
    this._baseY     = y;

    this.maxHp = GameConfig.PLAYER_MAX_HP;
    this.hp    = this.maxHp;
    this.lives = GameConfig.PLAYER_LIVES;

    // ── Sprite ──────────────────────────────────────────────────────────────
    this.sprite = scene.physics.add.sprite(x, y, ASSET_KEY_PLAYER_IDLE);

    // ── Animations ──────────────────────────────────────────────────────────
    this._createAnimations();

    // ── State machine ───────────────────────────────────────────────────────
    this._stateMachine = new PlayerStateMachine();
    this._stateMachine.onEnter = this._onEnterState.bind(this);
    this._stateMachine.onExit  = this._onExitState.bind(this);

    // ── Input ───────────────────────────────────────────────────────────────
    this._inputManager = new InputManager(scene as unknown as Phaser.Scene);

    // ── Animation-complete auto-transition ──────────────────────────────────
    this.sprite.on('animationcomplete', this._onAnimComplete, this);

    // ── Register fixed-update ───────────────────────────────────────────────
    this._fixedUpdateBound = this.fixedUpdate.bind(this);
    scene.registerFixedUpdate(this._fixedUpdateBound);

    // Play initial animation
    this.sprite.play(ASSET_KEY_PLAYER_IDLE, true);
  }

  // ── Fixed-tick entry point ────────────────────────────────────────────────

  /**
   * Called once per fixed timestep tick by {@link GameScene}.
   * Order: poll input → tick countdowns → process input → apply movement.
   *
   * @spec player-controller – FR-PL-01 through FR-PL-11
   * @implements NFR-PL-03
   */
  fixedUpdate(dt: number): void {
    const input = this._inputManager.poll();
    this._tickCountdowns();
    this._processInput(input);
    this._applyMovement(input);
  }

  // ── Health / lives ────────────────────────────────────────────────────────

  /**
   * Reduce HP by `amount` if the player is not currently invincible.
   * Triggers `onDeath()` when HP reaches zero.
   *
   * @spec player-health – Requirement: Player takes damage when hit and not invincible
   * @implements FR-PL-15, FR-PL-18
   */
  takeDamage(amount: number): void {
    if (this.iFramesRemaining > 0) return;

    this.hp = Math.max(0, this.hp - amount);
    if (this.hp === 0) {
      this._onDeath();
    } else {
      this._stateMachine.transition(PlayerState.Hurt);
    }
  }

  // ── Destroy ──────────────────────────────────────────────────────────────

  /**
   * Unregisters the fixed-update callback and destroys the sprite.
   *
   * @spec player-controller – Requirement: Callback is removed on destroy
   */
  destroy(): void {
    this._scene.unregisterFixedUpdate(this._fixedUpdateBound);
    this._hitbox?.destroy();
    this._hitbox = null;
    this.sprite.off('animationcomplete', this._onAnimComplete, this);
    this.sprite.destroy();
  }

  // ── Private: per-tick logic ───────────────────────────────────────────────

  private _tickCountdowns(): void {
    if (this.iFramesRemaining > 0)       this.iFramesRemaining--;
    if (this.specialCooldownTicks > 0)   this.specialCooldownTicks--;
  }

  /**
   * Translate input + current state into state-machine transitions.
   *
   * @spec player-state-machine, player-special-attack
   */
  private _processInput(input: Readonly<InputState>): void {
    const s = this._stateMachine.current;

    // Only react to action inputs when grounded and not locked in a one-shot animation
    const grounded   = s !== PlayerState.Jump && s !== PlayerState.JumpAttack;
    const actionable = grounded && s !== PlayerState.Hurt && s !== PlayerState.Knockdown &&
                       s !== PlayerState.GetUp && s !== PlayerState.LightAttack &&
                       s !== PlayerState.HeavyAttack && s !== PlayerState.Grab &&
                       s !== PlayerState.SpecialAttack;

    if (actionable) {
      // Special attack guard: HP cost + cooldown (spec player-special-attack FR-PL-11, FR-PL-22)
      if (input.specialAttack &&
          this.hp >= GameConfig.SPECIAL_ATTACK_HP_COST &&
          this.specialCooldownTicks === 0) {
        this._stateMachine.transition(PlayerState.SpecialAttack);
        return;
      }

      if (input.jump) {
        this._stateMachine.transition(PlayerState.Jump);
        return;
      }

      if (input.grab) {
        this._stateMachine.transition(PlayerState.Grab);
        return;
      }

      if (input.lightAttack) {
        this._stateMachine.transition(PlayerState.LightAttack);
        return;
      }

      if (input.heavyAttack) {
        this._stateMachine.transition(PlayerState.HeavyAttack);
        return;
      }
    }

    // Jump attack: only from Jump state
    if (s === PlayerState.Jump && (input.lightAttack || input.heavyAttack)) {
      this._stateMachine.transition(PlayerState.JumpAttack);
      return;
    }

    // Walk / Idle transitions
    if (actionable || s === PlayerState.Walk || s === PlayerState.Idle) {
      const moving = input.left || input.right || input.up || input.down;
      if (moving && s === PlayerState.Idle) {
        this._stateMachine.transition(PlayerState.Walk);
      } else if (!moving && s === PlayerState.Walk) {
        this._stateMachine.transition(PlayerState.Idle);
      }
    }
  }

  /**
   * Apply velocity / position for the current state.
   *
   * @spec player-movement – FR-PL-19, FR-PL-20, FR-PL-03
   */
  private _applyMovement(input: Readonly<InputState>): void {
    const s     = this._stateMachine.current;
    const spd   = GameConfig.PLAYER_WALK_SPEED / GameConfig.TARGET_FPS;

    const inJump = s === PlayerState.Jump || s === PlayerState.JumpAttack;

    if (!inJump) {
      // Horizontal movement (x axis)
      if (input.left)  { this.sprite.x -= spd; this.facingRight = false; }
      if (input.right) { this.sprite.x += spd; this.facingRight = true;  }

      // Depth movement (y axis, ground plane)
      if (input.up)   this._baseY -= spd;
      if (input.down) this._baseY += spd;

      // Clamp ground plane
      this._baseY = Phaser.Math.Clamp(this._baseY, GameConfig.GROUND_TOP, GameConfig.GROUND_BOTTOM);

      this.sprite.setFlipX(!this.facingRight);
      this.sprite.y = this._baseY;
    } else {
      // ── Jump arc (custom gravity, Phaser gravity is 0) ─────────────────
      this._jumpVelocityY += JUMP_GRAVITY_PER_TICK;
      this._jumpOffsetY   += this._jumpVelocityY;

      if (this._jumpOffsetY >= 0) {
        // Landed
        this._jumpOffsetY   = 0;
        this._jumpVelocityY = 0;
        this.sprite.y = this._baseY;
        this._stateMachine.transition(PlayerState.Idle);
      } else {
        this.sprite.y = this._baseY + this._jumpOffsetY;
      }

      // Horizontal movement allowed during jump
      if (input.left)  { this.sprite.x -= spd; this.facingRight = false; }
      if (input.right) { this.sprite.x += spd; this.facingRight = true;  }
      this.sprite.setFlipX(!this.facingRight);
    }

    // Keep hitbox in sync with sprite
    this._updateHitboxPosition();
  }

  // ── Private: state machine hooks ─────────────────────────────────────────

  /**
   * Called by the state machine when the player enters a new state.
   *
   * @spec player-controller – animation, hitbox, health hooks
   */
  private _onEnterState(state: PlayerState): void {
    // ── Play animation ──────────────────────────────────────────────────────
    const animKey = STATE_TO_ANIM_KEY[state];
    const looping = state === PlayerState.Idle || state === PlayerState.Walk || state === PlayerState.Jump;
    this.sprite.play(animKey, true);
    if (!looping) {
      // One-shot: no repeat
      this.sprite.anims.setRepeat(0);
    }

    // ── iFrames ─────────────────────────────────────────────────────────────
    if (state === PlayerState.GetUp) {
      // @spec player-health – Requirement: GetUp state grants invincibility frames
      this.iFramesRemaining = GameConfig.GETUP_IFRAMES;
    }

    // ── Special attack ──────────────────────────────────────────────────────
    if (state === PlayerState.SpecialAttack) {
      // @spec player-special-attack – Requirement: Special attack requires minimum health
      this.hp -= GameConfig.SPECIAL_ATTACK_HP_COST;
      this.specialCooldownTicks = GameConfig.SPECIAL_COOLDOWN_TICKS;
      // Dispatch area damage at active-frames moment (on enter)
      // @spec player-special-attack – Requirement: Special attack dispatches area damage
      this._combatBus?.dispatchAreaDamage(this, GameConfig.SPECIAL_ATTACK_RADIUS);
    }

    // ── Jump arc init ───────────────────────────────────────────────────────
    if (state === PlayerState.Jump) {
      this._jumpOffsetY   = 0;
      this._jumpVelocityY = JUMP_INITIAL_VY;
    }

    // ── Hitbox ──────────────────────────────────────────────────────────────
    if (ATTACK_STATES.has(state)) {
      this._spawnHitbox(state);
    }
  }

  /**
   * Called by the state machine just before leaving a state.
   * @spec player-controller – Requirement: Hitbox is removed on state exit
   */
  private _onExitState(state: PlayerState): void {
    if (ATTACK_STATES.has(state)) {
      this._destroyHitbox();
    }
  }

  /** Called when the sprite's current animation finishes. */
  private _onAnimComplete(): void {
    const s = this._stateMachine.current;

    if (AUTO_TRANSITION_TO_IDLE.has(s)) {
      this._stateMachine.transition(PlayerState.Idle);
      return;
    }

    // Knockdown auto-transitions to GetUp
    if (s === PlayerState.Knockdown) {
      this._stateMachine.transition(PlayerState.GetUp);
    }
  }

  // ── Private: death / respawn ──────────────────────────────────────────────

  /**
   * @spec player-health – Requirement: Losing all health costs one life and triggers respawn
   * @spec player-health – Requirement: Last life lost triggers Game Over
   */
  private _onDeath(): void {
    if (this.lives <= 0) {
      this._scene.triggerGameOver();
      return;
    }

    this.lives--;
    this.hp               = this.maxHp;
    this.iFramesRemaining = GameConfig.RESPAWN_IFRAMES;
    this._stateMachine.transition(PlayerState.GetUp);
  }

  // ── Private: hitbox helpers ───────────────────────────────────────────────

  /**
   * Spawns a hitbox rectangle in the scene's playerHitboxGroup.
   * @spec player-controller – Requirement: PlayerController spawns and despawns hitboxes
   */
  private _spawnHitbox(state: PlayerState): void {
    this._destroyHitbox();
    const dims = HITBOX[state];
    if (!dims) return;

    const { x, y } = this._hitboxPosition(dims);
    this._hitbox = this._scene.playerHitboxGroup.create(x, y, undefined) as Phaser.GameObjects.Rectangle;
    (this._hitbox as unknown as Phaser.Physics.Arcade.Body & { setSize: (w: number, h: number) => void })?.setSize?.(dims.w, dims.h);
  }

  private _destroyHitbox(): void {
    if (this._hitbox) {
      this._hitbox.destroy();
      this._hitbox = null;
    }
  }

  private _updateHitboxPosition(): void {
    if (!this._hitbox) return;
    const state = this._stateMachine.current;
    const dims  = HITBOX[state];
    if (!dims) return;
    const { x, y } = this._hitboxPosition(dims);
    this._hitbox.setPosition(x, y);
  }

  private _hitboxPosition(dims: { w: number; h: number; offsetX: number; offsetY: number }): { x: number; y: number } {
    const sign = this.facingRight ? 1 : -1;
    return {
      x: this.sprite.x + sign * (dims.offsetX + dims.w / 2),
      y: this.sprite.y + dims.offsetY,
    };
  }

  // ── Private: animation setup ──────────────────────────────────────────────

  /**
   * Creates all Phaser animation configs from the spritesheets.
   * Frame counts are authoritative from the asset audit.
   * @spec player-controller – Requirement: PlayerController plays the correct animation
   */
  private _createAnimations(): void {
    const anims = this.sprite.scene.anims;

    // Guard: only create once
    if (anims.exists(ASSET_KEY_PLAYER_IDLE)) return;

    const defs: Array<{ key: string; frameEnd: number; frameRate: number; repeat: number }> = [
      { key: ASSET_KEY_PLAYER_IDLE,      frameEnd: 3,  frameRate: 8,  repeat: -1 },
      { key: ASSET_KEY_PLAYER_WALK,      frameEnd: 9,  frameRate: 12, repeat: -1 },
      { key: ASSET_KEY_PLAYER_JUMP,      frameEnd: 3,  frameRate: 8,  repeat: 0  },
      { key: ASSET_KEY_PLAYER_JAB,       frameEnd: 2,  frameRate: 12, repeat: 0  },
      { key: ASSET_KEY_PLAYER_KICK,      frameEnd: 4,  frameRate: 12, repeat: 0  },
      { key: ASSET_KEY_PLAYER_JUMP_KICK, frameEnd: 2,  frameRate: 12, repeat: 0  },
      { key: ASSET_KEY_PLAYER_DIVE_KICK, frameEnd: 4,  frameRate: 12, repeat: 0  },
      { key: ASSET_KEY_PLAYER_HURT,      frameEnd: 1,  frameRate: 8,  repeat: 0  },
      // Placeholders (all use hurt.png = 2 frames)
      { key: ASSET_KEY_PLAYER_KNOCKDOWN, frameEnd: 1,  frameRate: 6,  repeat: 0  },
      { key: ASSET_KEY_PLAYER_GETUP,     frameEnd: 1,  frameRate: 6,  repeat: 0  },
      { key: ASSET_KEY_PLAYER_GRAB,      frameEnd: 1,  frameRate: 8,  repeat: 0  },
      { key: ASSET_KEY_PLAYER_SPECIAL,   frameEnd: 1,  frameRate: 8,  repeat: 0  },
    ];

    for (const def of defs) {
      anims.create({
        key: def.key,
        frames: anims.generateFrameNumbers(def.key, { start: 0, end: def.frameEnd }),
        frameRate: def.frameRate,
        repeat: def.repeat,
      });
    }
  }
}

/**
 * Minimal interface for what PlayerController needs from GameScene.
 * Avoids a circular import while keeping TypeScript strict.
 */
export interface GameSceneRef {
  physics: Phaser.Physics.Arcade.ArcadePhysics;
  registerFixedUpdate(fn: (dt: number) => void): void;
  unregisterFixedUpdate(fn: (dt: number) => void): void;
  triggerGameOver(): void;
  playerHitboxGroup: Phaser.Physics.Arcade.StaticGroup;
}
