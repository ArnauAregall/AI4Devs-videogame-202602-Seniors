/**
 * Boss archetype — 3-phase boss with escalating behaviour.
 *
 * @spec boss-controller
 * @spec boss-standard-attack
 * @spec boss-critical-attack
 * @implements FR-EA-20 through FR-EA-24, FR-BA-01 through FR-BA-36
 */
import Phaser from 'phaser';
import { CombatSystem }        from '../combat/CombatSystem';
import { AttackerCoordinator } from './AttackerCoordinator';
import { EnemyController, EnemyControllerConfig } from './EnemyController';
import { EnemyState }          from './EnemyState';
import {
  BOSS_MAX_HP, BOSS_PATROL_SPEED, BOSS_WALK_SPEED,
  BOSS_AGGRO_RADIUS, BOSS_ATTACK_RANGE,
  BOSS_PUNCH_DAMAGE, BOSS_PUNCH_KNOCKBACK_X, BOSS_PUNCH_KNOCKBACK_Y,
  BOSS_PUNCH_HIT_STUN, BOSS_HITBOX_W, BOSS_HITBOX_H,
  BOSS_KICK_HITBOX_W, BOSS_KICK_HITBOX_H,
  BOSS_KICK_DAMAGE, BOSS_KICK_KNOCKBACK_X, BOSS_KICK_KNOCKBACK_Y,
  BOSS_KICK_HIT_STUN,
  BOSS_PHASE2_THRESHOLD, BOSS_PHASE3_THRESHOLD,
  BOSS_PHASE3_SPEED_MULTIPLIER, BOSS_TRANSITION_FRAMES,
  BOSS_ATTACK_ACTIVE_TICKS, BOSS_ATTACK_COOLDOWN_TICKS,
  BOSS_HURT_FRAMES, BOSS_KNOCKDOWN_FRAMES,
  BOSS_ATTACK_STARTUP_FRAMES, BOSS_PUNCH_OFFSET_PX, BOSS_PUNCH_Y_OFFSET,
  BOSS_KICK_ALTERNATE_FRAMES,
  BOSS_ANIM_IDLE, BOSS_ANIM_WALK, BOSS_ANIM_ATTACK, BOSS_ANIM_HURT, BOSS_ANIM_DEATH,
  BOSS_ANIM_CRITICAL_TELEGRAPH, BOSS_ANIM_CRITICAL_ATTACK,
  BOSS_CRITICAL_DAMAGE, BOSS_CRITICAL_KNOCKBACK, BOSS_CRITICAL_KNOCKBACK_Y,
  BOSS_CRITICAL_HIT_STUN, BOSS_CRITICAL_HITBOX_W, BOSS_CRITICAL_HITBOX_H,
  BOSS_CRITICAL_PROBABILITY, BOSS_CRITICAL_COOLDOWN_TICKS,
  BOSS_PHASE2_CRITICAL_BOOST, BOSS_PHASE3_CRITICAL_BOOST,
} from './EnemyConfig';
import { ASSET_KEY_BOSS_IDLE } from '../assets/AssetKeys';
import { registerBossAnims }   from './EnemyAnimations';

export interface BossConfig {
  scene:        Phaser.Scene;
  id:           string;
  x:            number;
  y:            number;
  facingRight:  boolean;
  combatSystem: CombatSystem;
  coordinator:  AttackerCoordinator;
}

/** Internal sub-state for the Attack state — standard or critical path. */
const enum BossAttackPhase {
  Standard         = 0,
  CritTelegraph    = 1,
  CritActive       = 2,
}

export class BossController extends EnemyController {
  private readonly _hitboxId:       string;
  private _attackTimer:      number         = 0;
  private _hitboxActive:     boolean        = false;
  private _attackPhase:      BossAttackPhase = BossAttackPhase.Standard;
  private _phase:            number         = 1;
  private _transitioning:    boolean        = false;
  private _transitionTimer:  number         = 0;
  private _effectiveSpeed:   number;
  /** Mutable cooldown — halved on phase 3. @spec FR-EA-23 */
  private _attackCooldownFrames:  number = BOSS_ATTACK_COOLDOWN_TICKS;
  /** Ticks until a critical attack may be attempted again. @spec boss-critical-attack */
  private _criticalCooldownTicks: number = 0;
  /** Accumulated critical probability boost from phase transitions. @spec boss-controller MODIFIED */
  private _criticalBoost:         number = 0;

  get phase(): number { return this._phase; }

  constructor(cfg: BossConfig, onArrived?: () => void) {
    registerBossAnims(cfg.scene);
    const base: EnemyControllerConfig = {
      scene:           cfg.scene,
      id:              cfg.id,
      textureKey:      ASSET_KEY_BOSS_IDLE,
      x:               cfg.x,
      y:               cfg.y,
      facingRight:     cfg.facingRight,
      maxHp:           BOSS_MAX_HP,
      patrolSpeed:     BOSS_PATROL_SPEED,
      walkSpeed:       BOSS_WALK_SPEED,
      aggroRadius:     BOSS_AGGRO_RADIUS,
      attackRange:     BOSS_ATTACK_RANGE,
      hurtFrames:      BOSS_HURT_FRAMES,
      knockdownFrames: BOSS_KNOCKDOWN_FRAMES,
      combatSystem:    cfg.combatSystem,
      coordinator:     cfg.coordinator,
      animKeys: {
        [EnemyState.Idle]:      BOSS_ANIM_IDLE,
        [EnemyState.Patrol]:    BOSS_ANIM_WALK,
        [EnemyState.Aggro]:     BOSS_ANIM_WALK,
        [EnemyState.Attack]:    BOSS_ANIM_ATTACK,
        [EnemyState.Hurt]:      BOSS_ANIM_HURT,
        [EnemyState.Knockdown]: BOSS_ANIM_HURT,
        [EnemyState.Death]:     BOSS_ANIM_DEATH,
      },
      showHealthBar: false, // Boss uses HUD boss health bar instead. @spec FR-EB-26
    };
    super(base);
    this._hitboxId      = `boss_${cfg.id}_attack`;
    this._effectiveSpeed = BOSS_WALK_SPEED;
    // @spec FR-EA-24 — announce boss arrival
    if (onArrived) onArrived();
  }

  override fixedUpdate(playerX: number, playerY: number): void {
    if (this._transitioning) {
      this._transitionTimer++;
      if (this._transitionTimer >= BOSS_TRANSITION_FRAMES) {
        this._transitioning   = false;
        this._transitionTimer = 0;
        this.unfreeze();
      }
      return;
    }
    // Decrement critical cooldown every tick outside of the attack state.
    // @spec boss-critical-attack — "Cooldown decrements each tick"
    if (this._criticalCooldownTicks > 0 && this._fsm.state !== EnemyState.Attack) {
      this._criticalCooldownTicks--;
    }
    super.fixedUpdate(playerX, playerY);
    this._checkPhaseTransition();
  }

  protected _onEnterAttack(): void {
    this._attackTimer  = 0;
    this._hitboxActive = false;
    this._attackPhase  = this._selectAttack();

    if (this._attackPhase === BossAttackPhase.CritTelegraph) {
      // @spec boss-critical-attack — "Cooldown set on telegraph entry"
      this._criticalCooldownTicks = BOSS_CRITICAL_COOLDOWN_TICKS;
      this._sprite.play(BOSS_ANIM_CRITICAL_TELEGRAPH, true);
      // When telegraph animation ends, transition to critical active phase.
      this._sprite.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
        if (this._attackPhase === BossAttackPhase.CritTelegraph) {
          this._attackPhase = BossAttackPhase.CritActive;
          this._attackTimer = 0;
          this._sprite.play(BOSS_ANIM_CRITICAL_ATTACK, true);
        }
      });
    }
    // Standard attack animation is driven by EnemyController's animKeys mapping.
  }

  protected _tickAttack(_playerX: number, _playerY: number): void {
    this._attackTimer++;

    switch (this._attackPhase) {
      case BossAttackPhase.Standard:
        this._tickStandardAttack();
        break;
      case BossAttackPhase.CritTelegraph:
        // No hitbox during telegraph. Wait for animationcomplete callback.
        // Safety timeout: if animation takes > 3× its expected duration, advance.
        if (this._attackTimer > 60) {
          this._attackPhase = BossAttackPhase.CritActive;
          this._attackTimer = 0;
          this._sprite.play(BOSS_ANIM_CRITICAL_ATTACK, true);
        }
        break;
      case BossAttackPhase.CritActive:
        this._tickCriticalAttack();
        break;
    }
  }

  /** Standard punch/kick attack (existing behaviour, unified under new path). @spec boss-standard-attack */
  private _tickStandardAttack(): void {
    const facing: 'left' | 'right' = this._facingRight ? 'right' : 'left';
    const sign = this._facingRight ? 1 : -1;
    const useKick = this._phase >= 2 && (this._attackTimer % BOSS_KICK_ALTERNATE_FRAMES === 0);

    if (!this._hitboxActive && this._attackTimer === BOSS_ATTACK_STARTUP_FRAMES) {
      const w   = useKick ? BOSS_KICK_HITBOX_W : BOSS_HITBOX_W;
      const h   = useKick ? BOSS_KICK_HITBOX_H : BOSS_HITBOX_H;
      const dmg = useKick ? BOSS_KICK_DAMAGE   : BOSS_PUNCH_DAMAGE;
      const kbX = useKick ? BOSS_KICK_KNOCKBACK_X : BOSS_PUNCH_KNOCKBACK_X;
      const kbY = useKick ? BOSS_KICK_KNOCKBACK_Y : BOSS_PUNCH_KNOCKBACK_Y;
      const hs  = useKick ? BOSS_KICK_HIT_STUN    : BOSS_PUNCH_HIT_STUN;

      const cx = this._sprite.x + sign * (w / 2 + BOSS_PUNCH_OFFSET_PX);
      const cy = this._sprite.y - BOSS_PUNCH_Y_OFFSET;
      this._combatSystem.registerHitbox(
        this._hitboxId,
        { x: cx - w / 2, y: cy - h / 2, w, h },
        'enemy', dmg, kbX, kbY, hs, facing, false,
      );
      this._hitboxActive = true;
    }

    if (this._hitboxActive && this._attackTimer >= BOSS_ATTACK_ACTIVE_TICKS) {
      this._combatSystem.removeHitbox(this._hitboxId);
      this._hitboxActive = false;
    }

    if (this._attackTimer >= this._attackCooldownFrames) {
      this._finishAttack();
    }
  }

  /** Critical active frames — wide hitbox, high damage. @spec boss-critical-attack */
  private _tickCriticalAttack(): void {
    const facing: 'left' | 'right' = this._facingRight ? 'right' : 'left';
    const sign = this._facingRight ? 1 : -1;

    if (!this._hitboxActive && this._attackTimer === BOSS_ATTACK_STARTUP_FRAMES) {
      const cx = this._sprite.x + sign * (BOSS_CRITICAL_HITBOX_W / 2 + BOSS_PUNCH_OFFSET_PX);
      const cy = this._sprite.y - BOSS_PUNCH_Y_OFFSET;
      this._combatSystem.registerHitbox(
        this._hitboxId,
        { x: cx - BOSS_CRITICAL_HITBOX_W / 2, y: cy - BOSS_CRITICAL_HITBOX_H / 2, w: BOSS_CRITICAL_HITBOX_W, h: BOSS_CRITICAL_HITBOX_H },
        'enemy', BOSS_CRITICAL_DAMAGE, BOSS_CRITICAL_KNOCKBACK, BOSS_CRITICAL_KNOCKBACK_Y, BOSS_CRITICAL_HIT_STUN, facing, false,
      );
      this._hitboxActive = true;
    }

    // Hitbox active for slightly longer than standard to compensate for telegraph warning.
    if (this._hitboxActive && this._attackTimer >= BOSS_ATTACK_ACTIVE_TICKS + 4) {
      this._combatSystem.removeHitbox(this._hitboxId);
      this._hitboxActive = false;
    }

    if (this._attackTimer >= this._attackCooldownFrames) {
      this._finishAttack();
    }
  }

  protected _onExitAttack(): void {
    if (this._hitboxActive) {
      this._combatSystem.removeHitbox(this._hitboxId);
      this._hitboxActive = false;
    }
  }

  protected _onEnterDeath(): void {
    this._scene.events.emit('bossDefeated', this._id);
  }

  protected override _tickAggro(playerX: number, _playerY: number): void {
    const dx   = playerX - this._sprite.x;
    const dist = Math.abs(dx);

    this._facingRight = dx >= 0;
    this._sprite.setFlipX(!this._facingRight);

    if (dist <= this._attackRange) {
      if (this._coordinator.requestAttackToken()) {
        this._tokenHeld = true;
        this._fsm.transition(EnemyState.Attack);
        return;
      }
      this._sprite.setVelocityX(0);
      return;
    }

    this._sprite.setVelocityX(Math.sign(dx) * this._effectiveSpeed);
  }

  /**
   * Determine whether the next attack is standard or critical.
   * Critical requires: cooldown is 0 AND random roll < effective probability.
   * @spec boss-critical-attack — "Critical attack probability gate"
   */
  private _selectAttack(): BossAttackPhase {
    const effectiveProb = BOSS_CRITICAL_PROBABILITY + this._criticalBoost;
    if (this._criticalCooldownTicks === 0 && Math.random() < effectiveProb) {
      return BossAttackPhase.CritTelegraph;
    }
    return BossAttackPhase.Standard;
  }

  /**
   * @spec FR-EA-21, FR-EA-22, FR-EA-23, boss-controller MODIFIED
   */
  private _checkPhaseTransition(): void {
    const ratio = this._hp / this._maxHp;
    const target =
      ratio <= BOSS_PHASE3_THRESHOLD ? 3 :
      ratio <= BOSS_PHASE2_THRESHOLD ? 2 : 1;

    if (target > this._phase) {
      const prevPhase = this._phase;
      this._phase = target;

      // Apply cumulative critical boosts even if a phase was skipped.
      if (target >= 2 && prevPhase < 2) {
        this._criticalBoost += BOSS_PHASE2_CRITICAL_BOOST;
      }
      if (target >= 3 && prevPhase < 3) {
        this._effectiveSpeed      = Math.round(BOSS_WALK_SPEED * BOSS_PHASE3_SPEED_MULTIPLIER);
        this._attackCooldownFrames = Math.floor(BOSS_ATTACK_COOLDOWN_TICKS / 2);
        this._criticalBoost       += BOSS_PHASE3_CRITICAL_BOOST;
      }

      this._transitioning   = true;
      this._transitionTimer = 0;
      this.freeze();
      this._scene.events.emit('bossPhaseChange', { id: this._id, phase: this._phase });
    }
  }
}
