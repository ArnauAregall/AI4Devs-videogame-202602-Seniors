/**
 * Brawler archetype — melee punch attack.
 *
 * @spec brawler-controller
 * @implements FR-EA-01, FR-EA-02, FR-EA-06, FR-EA-07, FR-EA-09
 */
import Phaser from 'phaser';
import { CombatSystem }        from '../combat/CombatSystem';
import { AttackerCoordinator } from './AttackerCoordinator';
import { EnemyController, EnemyControllerConfig } from './EnemyController';
import {
  BRAWLER_MAX_HP, BRAWLER_PATROL_SPEED, BRAWLER_WALK_SPEED,
  BRAWLER_AGGRO_RADIUS, BRAWLER_ATTACK_RANGE,
  BRAWLER_PUNCH_DAMAGE, BRAWLER_PUNCH_KNOCKBACK_X, BRAWLER_PUNCH_KNOCKBACK_Y,
  BRAWLER_PUNCH_HIT_STUN, BRAWLER_HITBOX_W, BRAWLER_HITBOX_H,
  BRAWLER_ATTACK_ACTIVE_TICKS, BRAWLER_ATTACK_COOLDOWN_TICKS,
  BRAWLER_HURT_FRAMES, BRAWLER_KNOCKDOWN_FRAMES,
  BRAWLER_ATTACK_STARTUP_FRAMES, BRAWLER_PUNCH_OFFSET_PX, BRAWLER_PUNCH_Y_OFFSET,
} from './EnemyConfig';
import { ASSET_KEY_PUNK_IDLE } from '../assets/AssetKeys';

export interface BrawlerConfig {
  scene:        Phaser.Scene;
  id:           string;
  x:            number;
  y:            number;
  facingRight:  boolean;
  combatSystem: CombatSystem;
  coordinator:  AttackerCoordinator;
}

export class BrawlerController extends EnemyController {
  private readonly _hitboxId: string;
  private _attackTimer:   number  = 0;
  private _hitboxActive:  boolean = false;

  constructor(cfg: BrawlerConfig) {
    const base: EnemyControllerConfig = {
      scene:           cfg.scene,
      id:              cfg.id,
      textureKey:      ASSET_KEY_PUNK_IDLE,
      x:               cfg.x,
      y:               cfg.y,
      facingRight:     cfg.facingRight,
      maxHp:           BRAWLER_MAX_HP,
      patrolSpeed:     BRAWLER_PATROL_SPEED,
      walkSpeed:       BRAWLER_WALK_SPEED,
      aggroRadius:     BRAWLER_AGGRO_RADIUS,
      attackRange:     BRAWLER_ATTACK_RANGE,
      hurtFrames:      BRAWLER_HURT_FRAMES,
      knockdownFrames: BRAWLER_KNOCKDOWN_FRAMES,
      combatSystem:    cfg.combatSystem,
      coordinator:     cfg.coordinator,
    };
    super(base);
    this._hitboxId = `brawler_${cfg.id}_punch`;
  }

  protected _onEnterAttack(): void {
    this._attackTimer  = 0;
    this._hitboxActive = false;
  }

  protected _tickAttack(_playerX: number, _playerY: number): void {
    this._attackTimer++;
    const facing: 'left' | 'right' = this._facingRight ? 'right' : 'left';
    const sign = this._facingRight ? 1 : -1;

    if (!this._hitboxActive && this._attackTimer === BRAWLER_ATTACK_STARTUP_FRAMES) {
      const cx = this._sprite.x + sign * (BRAWLER_HITBOX_W / 2 + BRAWLER_PUNCH_OFFSET_PX);
      const cy = this._sprite.y - BRAWLER_PUNCH_Y_OFFSET;
      this._combatSystem.registerHitbox(
        this._hitboxId,
        { x: cx - BRAWLER_HITBOX_W / 2, y: cy - BRAWLER_HITBOX_H / 2, w: BRAWLER_HITBOX_W, h: BRAWLER_HITBOX_H },
        'enemy',
        BRAWLER_PUNCH_DAMAGE,
        BRAWLER_PUNCH_KNOCKBACK_X,
        BRAWLER_PUNCH_KNOCKBACK_Y,
        BRAWLER_PUNCH_HIT_STUN,
        facing,
        false,
      );
      this._hitboxActive = true;
    }

    if (this._hitboxActive && this._attackTimer >= BRAWLER_ATTACK_ACTIVE_TICKS) {
      this._combatSystem.removeHitbox(this._hitboxId);
      this._hitboxActive = false;
    }

    if (this._attackTimer >= BRAWLER_ATTACK_COOLDOWN_TICKS) {
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
