/**
 * Knife Thrower archetype — ranged enemy that maintains distance and throws knives.
 *
 * @spec knife-thrower-controller
 * @implements FR-EA-01, FR-EA-04, FR-EA-06, FR-EA-07, FR-EA-09, FR-EA-19
 */
import Phaser from 'phaser';
import { CombatSystem }        from '../combat/CombatSystem';
import { AttackerCoordinator } from './AttackerCoordinator';
import { EnemyController, EnemyControllerConfig } from './EnemyController';
import { EnemyState }          from './EnemyState';
import { KnifeProjectile }     from './KnifeProjectile';
import {
  KNIFE_THROWER_MAX_HP, KNIFE_THROWER_WALK_SPEED, KNIFE_THROWER_RETREAT_SPEED,
  KNIFE_THROWER_AGGRO_RADIUS, KNIFE_THROWER_MIN_DISTANCE, KNIFE_THROWER_MAX_DISTANCE,
  KNIFE_THROWER_ATTACK_RANGE, KNIFE_THROW_COOLDOWN_FRAMES,
  KNIFE_THROWER_HURT_FRAMES, KNIFE_THROWER_KNOCKDOWN_FRAMES,
  KNIFE_THROWER_PATROL_SPEED, KNIFE_THROWER_THROW_STARTUP_FRAMES, KNIFE_THROWER_THROW_Y_OFFSET,
  PUNK_ANIM_IDLE, PUNK_ANIM_WALK, PUNK_ANIM_ATTACK, PUNK_ANIM_HURT, PUNK_ANIM_DEATH,
} from './EnemyConfig';
import { ASSET_KEY_PUNK_IDLE } from '../assets/AssetKeys';
import { registerPunkAnims }   from './EnemyAnimations';

export interface KnifeThrowerConfig {
  scene:        Phaser.Scene;
  id:           string;
  x:            number;
  y:            number;
  facingRight:  boolean;
  combatSystem: CombatSystem;
  coordinator:  AttackerCoordinator;
}

export class KnifeThrowerController extends EnemyController {
  private _attackTimer: number = 0;
  private _knives:      KnifeProjectile[] = [];

  constructor(cfg: KnifeThrowerConfig) {
    registerPunkAnims(cfg.scene);
    const base: EnemyControllerConfig = {
      scene:           cfg.scene,
      id:              cfg.id,
      textureKey:      ASSET_KEY_PUNK_IDLE,
      x:               cfg.x,
      y:               cfg.y,
      facingRight:     cfg.facingRight,
      maxHp:           KNIFE_THROWER_MAX_HP,
      patrolSpeed:     KNIFE_THROWER_PATROL_SPEED,
      walkSpeed:       KNIFE_THROWER_WALK_SPEED,
      aggroRadius:     KNIFE_THROWER_AGGRO_RADIUS,
      attackRange:     KNIFE_THROWER_ATTACK_RANGE,
      hurtFrames:      KNIFE_THROWER_HURT_FRAMES,
      knockdownFrames: KNIFE_THROWER_KNOCKDOWN_FRAMES,
      combatSystem:    cfg.combatSystem,
      coordinator:     cfg.coordinator,
      animKeys: {
        [EnemyState.Idle]:      PUNK_ANIM_IDLE,
        [EnemyState.Patrol]:    PUNK_ANIM_WALK,
        [EnemyState.Aggro]:     PUNK_ANIM_WALK,
        [EnemyState.Attack]:    PUNK_ANIM_ATTACK,
        [EnemyState.Hurt]:      PUNK_ANIM_HURT,
        [EnemyState.Knockdown]: PUNK_ANIM_HURT,
        [EnemyState.Death]:     PUNK_ANIM_DEATH,
      },
    };
    super(base);
  }

  override fixedUpdate(playerX: number, playerY: number): void {
    for (let i = this._knives.length - 1; i >= 0; i--) {
      this._knives[i].fixedUpdate(playerX, playerY);
      if (this._knives[i].isDone) {
        this._knives[i].destroy();
        this._knives.splice(i, 1);
      }
    }
    super.fixedUpdate(playerX, playerY);
  }

  // Maintain optimal throwing distance
  protected override _tickAggro(playerX: number, _playerY: number): void {
    const dx   = playerX - this._sprite.x;
    const dist = Math.abs(dx);

    this._facingRight = dx >= 0;
    this._sprite.setFlipX(!this._facingRight);

    if (dist < KNIFE_THROWER_MIN_DISTANCE) {
      const dir = -Math.sign(dx) as 1 | -1;
      this._sprite.setVelocityX(dir * KNIFE_THROWER_RETREAT_SPEED);
      return;
    }

    if (dist > KNIFE_THROWER_MAX_DISTANCE) {
      const dir = Math.sign(dx) as 1 | -1;
      this._sprite.setVelocityX(dir * KNIFE_THROWER_WALK_SPEED);
      return;
    }

    this._sprite.setVelocityX(0);

    if (this._coordinator.requestAttackToken()) {
      this._tokenHeld = true;
      this._fsm.transition(EnemyState.Attack);
    }
  }

  protected _onEnterAttack(): void {
    this._attackTimer = 0;
  }

  protected _tickAttack(_playerX: number, _playerY: number): void {
    this._attackTimer++;

    if (this._attackTimer === KNIFE_THROWER_THROW_STARTUP_FRAMES) {
      this._knives.push(new KnifeProjectile({
        scene:        this._scene,
        combatSystem: this._combatSystem,
        throwerId:    `enemy_${this._id}`,
        x:            this._sprite.x,
        y:            this._sprite.y - KNIFE_THROWER_THROW_Y_OFFSET,
        facingRight:  this._facingRight,
      }));
    }

    if (this._attackTimer >= KNIFE_THROW_COOLDOWN_FRAMES) {
      this._finishAttack();
    }
  }

  override destroy(): void {
    for (const k of this._knives) k.destroy();
    this._knives = [];
    super.destroy();
  }
}
