/**
 * Rusher archetype — charges at high speed and delivers a 3-hit flurry.
 *
 * @spec rusher-controller
 * @implements FR-EA-01, FR-EA-03, FR-EA-06, FR-EA-07, FR-EA-09
 */
import Phaser from 'phaser';
import { CombatSystem }        from '../combat/CombatSystem';
import { AttackerCoordinator } from './AttackerCoordinator';
import { EnemyController, EnemyControllerConfig } from './EnemyController';
import { EnemyState }          from './EnemyState';
import {
  RUSHER_MAX_HP, RUSHER_PATROL_SPEED, RUSHER_WALK_SPEED, RUSHER_CHARGE_SPEED,
  RUSHER_AGGRO_RADIUS, RUSHER_ATTACK_RANGE,
  RUSHER_FLURRY_DAMAGE, RUSHER_FLURRY_KNOCKBACK_X, RUSHER_FLURRY_KNOCKBACK_Y,
  RUSHER_FLURRY_HIT_STUN, RUSHER_HITBOX_W, RUSHER_HITBOX_H,
  RUSHER_FLURRY_COUNT, RUSHER_FLURRY_GAP_FRAMES,
  RUSHER_ATTACK_COOLDOWN_TICKS, RUSHER_HURT_FRAMES, RUSHER_KNOCKDOWN_FRAMES,
  RUSHER_FLURRY_CYCLE_FRAMES, RUSHER_FLURRY_HIT_FRAME,
  RUSHER_PUNCH_OFFSET_PX, RUSHER_PUNCH_Y_OFFSET,
} from './EnemyConfig';
import { ASSET_KEY_PUNK_IDLE } from '../assets/AssetKeys';

export interface RusherConfig {
  scene:        Phaser.Scene;
  id:           string;
  x:            number;
  y:            number;
  facingRight:  boolean;
  combatSystem: CombatSystem;
  coordinator:  AttackerCoordinator;
}

export class RusherController extends EnemyController {
  private readonly _hitboxId: string;
  private _attackTimer:   number  = 0;
  private _hitCount:      number  = 0;
  private _gapTimer:      number  = 0;
  private _hitboxActive:  boolean = false;

  constructor(cfg: RusherConfig) {
    const base: EnemyControllerConfig = {
      scene:           cfg.scene,
      id:              cfg.id,
      textureKey:      ASSET_KEY_PUNK_IDLE,
      x:               cfg.x,
      y:               cfg.y,
      facingRight:     cfg.facingRight,
      maxHp:           RUSHER_MAX_HP,
      patrolSpeed:     RUSHER_PATROL_SPEED,
      walkSpeed:       RUSHER_WALK_SPEED,
      aggroRadius:     RUSHER_AGGRO_RADIUS,
      attackRange:     RUSHER_ATTACK_RANGE,
      hurtFrames:      RUSHER_HURT_FRAMES,
      knockdownFrames: RUSHER_KNOCKDOWN_FRAMES,
      combatSystem:    cfg.combatSystem,
      coordinator:     cfg.coordinator,
    };
    super(base);
    this._hitboxId = `rusher_${cfg.id}_flurry`;
  }

  // Override aggro to charge
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

    const dir = Math.sign(dx);
    this._sprite.setVelocityX(dir * RUSHER_CHARGE_SPEED);
  }

  protected _onEnterAttack(): void {
    this._attackTimer  = 0;
    this._hitCount     = 0;
    this._gapTimer     = 0;
    this._hitboxActive = false;
  }

  protected _tickAttack(_playerX: number, _playerY: number): void {
    this._attackTimer++;
    const facing: 'left' | 'right' = this._facingRight ? 'right' : 'left';
    const sign = this._facingRight ? 1 : -1;

    if (this._hitboxActive) {
      this._gapTimer++;
      if (this._gapTimer >= RUSHER_FLURRY_GAP_FRAMES) {
        this._combatSystem.removeHitbox(this._hitboxId);
        this._hitboxActive = false;
        this._gapTimer     = 0;
      }
    } else if (this._hitCount < RUSHER_FLURRY_COUNT && this._attackTimer % RUSHER_FLURRY_CYCLE_FRAMES === RUSHER_FLURRY_HIT_FRAME) {
      const cx = this._sprite.x + sign * (RUSHER_HITBOX_W / 2 + RUSHER_PUNCH_OFFSET_PX);
      const cy = this._sprite.y - RUSHER_PUNCH_Y_OFFSET;
      this._combatSystem.registerHitbox(
        this._hitboxId,
        { x: cx - RUSHER_HITBOX_W / 2, y: cy - RUSHER_HITBOX_H / 2, w: RUSHER_HITBOX_W, h: RUSHER_HITBOX_H },
        'enemy',
        RUSHER_FLURRY_DAMAGE,
        RUSHER_FLURRY_KNOCKBACK_X,
        RUSHER_FLURRY_KNOCKBACK_Y,
        RUSHER_FLURRY_HIT_STUN,
        facing,
        false,
      );
      this._hitboxActive = true;
      this._hitCount++;
    }

    if (this._attackTimer >= RUSHER_ATTACK_COOLDOWN_TICKS) {
      this._finishAttack();
    }
  }

  protected _onExitAttack(): void {
    if (this._hitboxActive) {
      this._combatSystem.removeHitbox(this._hitboxId);
      this._hitboxActive = false;
    }
  }
}
