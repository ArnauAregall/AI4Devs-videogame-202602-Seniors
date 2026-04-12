/**
 * Boss archetype — 3-phase boss with escalating behaviour.
 *
 * @spec boss-controller
 * @implements FR-EA-20 through FR-EA-24
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

export class BossController extends EnemyController {
  private readonly _hitboxId:       string;
  private _attackTimer:      number  = 0;
  private _hitboxActive:     boolean = false;
  private _phase:            number  = 1;
  private _transitioning:    boolean = false;
  private _transitionTimer:  number  = 0;
  private _effectiveSpeed:   number;
  /** Mutable cooldown — halved on phase 3. @spec FR-EA-23 */
  private _attackCooldownFrames: number = BOSS_ATTACK_COOLDOWN_TICKS;

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
    super.fixedUpdate(playerX, playerY);
    this._checkPhaseTransition();
  }

  protected _onEnterAttack(): void {
    this._attackTimer  = 0;
    this._hitboxActive = false;
  }

  protected _tickAttack(_playerX: number, _playerY: number): void {
    this._attackTimer++;
    const facing: 'left' | 'right' = this._facingRight ? 'right' : 'left';
    const sign = this._facingRight ? 1 : -1;
    const useKick = this._phase >= 2 && (this._attackTimer % BOSS_KICK_ALTERNATE_FRAMES === 0);

    if (!this._hitboxActive && this._attackTimer === BOSS_ATTACK_STARTUP_FRAMES) {
      const w  = useKick ? BOSS_KICK_HITBOX_W : BOSS_HITBOX_W;
      const h  = useKick ? BOSS_KICK_HITBOX_H : BOSS_HITBOX_H;
      const dmg = useKick ? BOSS_KICK_DAMAGE : BOSS_PUNCH_DAMAGE;
      const kbX = useKick ? BOSS_KICK_KNOCKBACK_X : BOSS_PUNCH_KNOCKBACK_X;
      const kbY = useKick ? BOSS_KICK_KNOCKBACK_Y : BOSS_PUNCH_KNOCKBACK_Y;
      const hs  = useKick ? BOSS_KICK_HIT_STUN : BOSS_PUNCH_HIT_STUN;

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
   * @spec FR-EA-21, FR-EA-22, FR-EA-23
   */
  private _checkPhaseTransition(): void {
    const ratio = this._hp / this._maxHp;
    const target =
      ratio <= BOSS_PHASE3_THRESHOLD ? 3 :
      ratio <= BOSS_PHASE2_THRESHOLD ? 2 : 1;

    if (target > this._phase) {
      this._phase = target;
      if (target === 3) {
        this._effectiveSpeed      = Math.round(BOSS_WALK_SPEED * BOSS_PHASE3_SPEED_MULTIPLIER);
        this._attackCooldownFrames = Math.floor(BOSS_ATTACK_COOLDOWN_TICKS / 2);
      }
      this._transitioning   = true;
      this._transitionTimer = 0;
      this.freeze();
      this._scene.events.emit('bossPhaseChange', { id: this._id, phase: this._phase });
    }
  }
}
