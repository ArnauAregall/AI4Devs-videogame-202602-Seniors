/**
 * Abstract base class for all enemy archetypes.
 * Shared logic: sprite, hurtbox registration (rect-based), hit-response,
 * patrol, aggro-walk, Hurt / Knockdown / Death state handling.
 * Subclasses override _onEnterAttack() and _tickAttack() for archetype-specific combat.
 *
 * @spec enemy-controller
 * @implements FR-EA-05 through FR-EA-17
 */
import Phaser from 'phaser';
import { GameConfig }                  from '../config/GameConfig';
import { CombatSystem } from '../combat/CombatSystem';
import { HitEvent }                    from '../combat/HitEvent';
import { AttackerCoordinator }         from './AttackerCoordinator';
import { EnemyState }                  from './EnemyState';
import { EnemyStateMachine }           from './EnemyStateMachine';
import {
  ENEMY_HURTBOX_W, ENEMY_HURTBOX_H, ENEMY_BODY_HALF_H,
  KNOCKDOWN_THRESHOLD, DEATH_LINGER_FRAMES,
  ENEMY_IDLE_TO_PATROL_FRAMES, ENEMY_PATROL_FLIP_FRAMES,
} from './EnemyConfig';

export interface EnemyControllerConfig {
  scene:               Phaser.Scene;
  id:                  string;
  textureKey:          string;
  x:                   number;
  y:                   number;
  facingRight:         boolean;
  maxHp:               number;
  patrolSpeed:         number;
  walkSpeed:           number;
  aggroRadius:         number;
  attackRange:         number;
  hurtFrames:          number;
  knockdownFrames:     number;
  combatSystem:        CombatSystem;
  coordinator:         AttackerCoordinator;
}

export abstract class EnemyController {
  protected readonly _scene:        Phaser.Scene;
  protected readonly _id:           string;
  protected          _sprite:       Phaser.Physics.Arcade.Sprite;
  protected          _hp:           number;
  protected readonly _maxHp:        number;
  protected          _facingRight:  boolean;
  protected readonly _patrolSpeed:  number;
  protected readonly _walkSpeed:    number;
  protected readonly _aggroRadius:  number;
  protected readonly _attackRange:  number;
  protected readonly _hurtFrames:   number;
  protected readonly _knockdownFrames: number;
  protected readonly _combatSystem: CombatSystem;
  protected readonly _coordinator:  AttackerCoordinator;

  protected _fsm:                   EnemyStateMachine;
  protected _stateTimer:            number = 0;
  protected _accumulatedKnockback:  number = 0;
  protected _dead:                  boolean = false;
  protected _lingerTimer:           number = 0;
  protected _tokenHeld:             boolean = false;
  protected _frozen:                boolean = false;

  private readonly _hurtboxId:      string;
  private readonly _onHitBound:     (targetId: string, event: HitEvent) => void;

  get isDead():  boolean    { return this._dead; }
  get id():      string     { return this._id; }
  get x():       number     { return this._sprite.x; }
  get y():       number     { return this._sprite.y; }
  get hp():      number     { return this._hp; }
  get maxHp():   number     { return this._maxHp; }
  get state():   EnemyState { return this._fsm.state; }
  get sprite():  Phaser.Physics.Arcade.Sprite { return this._sprite; }

  constructor(cfg: EnemyControllerConfig) {
    this._scene           = cfg.scene;
    this._id              = cfg.id;
    this._hp              = cfg.maxHp;
    this._maxHp           = cfg.maxHp;
    this._facingRight     = cfg.facingRight;
    this._patrolSpeed     = cfg.patrolSpeed;
    this._walkSpeed       = cfg.walkSpeed;
    this._aggroRadius     = cfg.aggroRadius;
    this._attackRange     = cfg.attackRange;
    this._hurtFrames      = cfg.hurtFrames;
    this._knockdownFrames = cfg.knockdownFrames;
    this._combatSystem    = cfg.combatSystem;
    this._coordinator     = cfg.coordinator;

    this._sprite = cfg.scene.physics.add.sprite(cfg.x, cfg.y, cfg.textureKey);
    this._sprite.setDepth(GameConfig.ENTITY_DEPTH);
    this._sprite.setFlipX(!cfg.facingRight);

    this._hurtboxId   = `enemy_${cfg.id}`;
    this._onHitBound  = this._dispatchedHit.bind(this);

    cfg.combatSystem.registerHurtbox(
      this._hurtboxId,
      {
        x: cfg.x - ENEMY_HURTBOX_W / 2,
        y: cfg.y - ENEMY_BODY_HALF_H - ENEMY_HURTBOX_H / 2,
        w: ENEMY_HURTBOX_W,
        h: ENEMY_HURTBOX_H,
      },
      'enemy',
    );
    cfg.combatSystem.onHit(this._onHitBound);

    this._fsm = new EnemyStateMachine(
      EnemyState.Idle,
      this._onEnterState.bind(this),
      this._onExitState.bind(this),
    );
  }

  // ── Main update loop ───────────────────────────────────────────────────────

  fixedUpdate(playerX: number, playerY: number): void {
    if (this._dead) return;

    // Keep hurtbox in sync with sprite position
    const hb = this._combatSystem.getHurtbox(this._hurtboxId);
    if (hb) hb.update(this._sprite.x, this._sprite.y - ENEMY_BODY_HALF_H);

    if (this._frozen) return;

    this._stateTimer++;

    switch (this._fsm.state) {
      case EnemyState.Idle:      this._tickIdle(playerX, playerY);   break;
      case EnemyState.Patrol:    this._tickPatrol(playerX, playerY); break;
      case EnemyState.Aggro:     this._tickAggro(playerX, playerY);  break;
      case EnemyState.Attack:    this._tickAttack(playerX, playerY); break;
      case EnemyState.Hurt:      this._tickHurt();                   break;
      case EnemyState.Knockdown: this._tickKnockdown();              break;
      case EnemyState.Death:     this._tickDeath();                  break;
    }
  }

  freeze():   void { this._frozen = true; }
  unfreeze(): void { this._frozen = false; }

  destroy(): void {
    this._releaseToken();
    this._combatSystem.offHit(this._onHitBound);
    this._combatSystem.removeHurtbox(this._hurtboxId);
    this._sprite.destroy();
  }

  // ── State hooks ───────────────────────────────────────────────────────────

  protected _onEnterState(state: EnemyState): void {
    this._stateTimer = 0;
    switch (state) {
      case EnemyState.Idle:
        this._sprite.setVelocityX(0);
        break;
      case EnemyState.Aggro:
        this._accumulatedKnockback = 0;
        break;
      case EnemyState.Attack:
        this._onEnterAttack();
        break;
      case EnemyState.Hurt:
        this._sprite.setVelocityX(0);
        break;
      case EnemyState.Knockdown:
        this._sprite.setVelocityX(0);
        break;
      case EnemyState.Death:
        this._sprite.setVelocityX(0);
        this._lingerTimer = 0;
        this._releaseToken();
        this._combatSystem.removeHurtbox(this._hurtboxId);
        this._onEnterDeath();
        break;
    }
  }

  protected _onExitState(state: EnemyState): void {
    if (state === EnemyState.Attack) {
      this._releaseToken();
      this._onExitAttack();
    }
  }

  // ── Shared tick helpers ───────────────────────────────────────────────────

  private _tickIdle(playerX: number, _playerY: number): void {
    const dist = Math.abs(playerX - this._sprite.x);
    if (dist <= this._aggroRadius) {
      this._fsm.transition(EnemyState.Aggro);
    } else if (this._stateTimer > ENEMY_IDLE_TO_PATROL_FRAMES && this._patrolSpeed > 0) {
      this._fsm.transition(EnemyState.Patrol);
    }
  }

  private _tickPatrol(_playerX: number, _playerY: number): void {
    const dist = Math.abs(_playerX - this._sprite.x);
    if (dist <= this._aggroRadius) {
      this._fsm.transition(EnemyState.Aggro);
      return;
    }
    const dir = this._facingRight ? 1 : -1;
    this._sprite.setVelocityX(dir * this._patrolSpeed);
    if (this._stateTimer > ENEMY_PATROL_FLIP_FRAMES) {
      this._facingRight = !this._facingRight;
      this._sprite.setFlipX(!this._facingRight);
      this._fsm.transition(EnemyState.Idle);
    }
  }

  protected _tickAggro(playerX: number, _playerY: number): void {
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

    const dir = Math.sign(dx);
    this._sprite.setVelocityX(dir * this._walkSpeed);
  }

  private _tickHurt(): void {
    if (this._stateTimer >= this._hurtFrames) {
      this._fsm.transition(EnemyState.Aggro);
    }
  }

  private _tickKnockdown(): void {
    if (this._stateTimer >= this._knockdownFrames) {
      if (this._hp <= 0) {
        this._fsm.transition(EnemyState.Death);
      } else {
        this._fsm.transition(EnemyState.Aggro);
      }
    }
  }

  private _tickDeath(): void {
    this._lingerTimer++;
    if (this._lingerTimer >= DEATH_LINGER_FRAMES) {
      this._dead = true;
    }
  }

  // ── Hit reception ─────────────────────────────────────────────────────────

  /**
   * Called by CombatSystem onHit for EVERY resolved hit.
   * We only act if targetId matches this enemy's hurtbox.
   */
  private _dispatchedHit(targetId: string, event: HitEvent): void {
    if (targetId !== this._hurtboxId) return;
    this._applyHit(event);
  }

  protected _applyHit(event: HitEvent): void {
    if (this._dead || this._fsm.state === EnemyState.Death) return;

    this._hp = Math.max(0, this._hp - event.damage);
    this._accumulatedKnockback += event.knockbackX;

    const dir = event.attackerFacing === 'right' ? 1 : -1;
    this._sprite.setVelocityX(dir * Math.abs(event.knockbackX));
    if (event.knockbackY !== 0) {
      this._sprite.setVelocityY(event.knockbackY * 20);
    }

    if (this._hp <= 0) {
      this._fsm.transition(EnemyState.Death);
      return;
    }

    if (this._accumulatedKnockback >= KNOCKDOWN_THRESHOLD) {
      this._accumulatedKnockback = 0;
      this._fsm.transition(EnemyState.Knockdown);
      return;
    }

    if (event.isGrab) {
      this._fsm.transition(EnemyState.Knockdown);
    } else {
      this._fsm.transition(EnemyState.Hurt);
    }
  }

  // ── Abstract / overridable hooks ──────────────────────────────────────────

  protected abstract _onEnterAttack(): void;
  protected abstract _tickAttack(playerX: number, playerY: number): void;
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  protected _onExitAttack(): void {}
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  protected _onEnterDeath(): void {}

  protected _finishAttack(): void {
    this._fsm.transition(EnemyState.Aggro);
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  private _releaseToken(): void {
    if (this._tokenHeld) {
      this._coordinator.releaseToken();
      this._tokenHeld = false;
    }
  }
}
