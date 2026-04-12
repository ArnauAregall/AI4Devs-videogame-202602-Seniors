/**
 * Knife projectile — travels horizontally, checks player hurtbox via CombatSystem,
 * and can be deflected by the player's active hitbox.
 *
 * @spec knife-projectile
 * @implements FR-EA-04
 */
import Phaser from 'phaser';
import { CombatSystem } from '../combat/CombatSystem';
import { HitEvent }     from '../combat/HitEvent';
import {
  KNIFE_SPEED, KNIFE_DAMAGE, KNIFE_KNOCKBACK_X, KNIFE_MAX_RANGE,
  KNIFE_HITBOX_W, KNIFE_HITBOX_H, KNIFE_HIT_STUN, KNIFE_PROJECTILE_DEBUG_COLOR,
} from './EnemyConfig';

export interface KnifeProjectileConfig {
  scene:        Phaser.Scene;
  combatSystem: CombatSystem;
  /** Hurtbox ID of the thrower (e.g. `enemy_xyz`) — used for reflection hit. */
  throwerId:    string;
  x:            number;
  y:            number;
  facingRight:  boolean;
}

export class KnifeProjectile {
  private readonly _combatSystem:   CombatSystem;
  private readonly _throwerId:      string;
  private          _sprite:         Phaser.GameObjects.Rectangle;
  private          _dirX:           1 | -1;
  private          _distTravelled:  number  = 0;
  private          _done:           boolean = false;
  /** True after the knife has been deflected by the player. */
  private          _reflected:      boolean = false;

  get isDone(): boolean { return this._done; }

  constructor(cfg: KnifeProjectileConfig) {
    this._combatSystem = cfg.combatSystem;
    this._throwerId    = cfg.throwerId;
    this._dirX         = cfg.facingRight ? 1 : -1;
    this._sprite       = cfg.scene.add.rectangle(
      cfg.x, cfg.y, KNIFE_HITBOX_W, KNIFE_HITBOX_H, KNIFE_PROJECTILE_DEBUG_COLOR,
    );
  }

  /**
   * Advance by one tick, check collisions.
   * @spec FR-EA-04
   */
  fixedUpdate(_playerX: number, _playerY: number): void {
    if (this._done) return;

    this._sprite.x    += this._dirX * KNIFE_SPEED;
    this._distTravelled += KNIFE_SPEED;

    if (this._distTravelled >= KNIFE_MAX_RANGE) {
      this._done = true;
      return;
    }

    this._checkPlayerHit();
    if (!this._done) this._checkDeflection();
    if (!this._done && this._reflected) this._checkThrowerHit();
  }

  destroy(): void {
    this._sprite.destroy();
  }

  // ── Collision ─────────────────────────────────────────────────────────────

  private _checkPlayerHit(): void {
    if (this._reflected) return; // reflected knife skips player-hit check
    for (const [id, hurtbox] of this._combatSystem.getHurtboxes()) {
      if (hurtbox.teamTag !== 'player') continue;
      if (hurtbox.invincible) continue;

      const r = hurtbox.rect;
      if (this._rectsOverlap(
        this._sprite.x - KNIFE_HITBOX_W / 2, this._sprite.y - KNIFE_HITBOX_H / 2,
        KNIFE_HITBOX_W, KNIFE_HITBOX_H,
        r.x, r.y, r.w, r.h,
      )) {
        const facing: 'left' | 'right' = this._dirX === 1 ? 'right' : 'left';
        const event: HitEvent = {
          damage:         KNIFE_DAMAGE,
          knockbackX:     KNIFE_KNOCKBACK_X,
          knockbackY:     0,
          hitStunFrames:  KNIFE_HIT_STUN,
          attackerFacing: facing,
          teamTag:        'enemy',
          isGrab:         false,
          isAoe:          false,
        };
        this._combatSystem.dispatchHit(id, event);
        this._done = true;
        return;
      }
    }
  }

  /**
   * Deflect: reverse the knife direction and mark it as reflected.
   * @spec FR-EA-04
   */
  private _checkDeflection(): void {
    for (const [, hx] of this._combatSystem.getHitboxes()) {
      if (hx.teamTag !== 'player') continue;
      const r = hx.rect;
      if (this._rectsOverlap(
        this._sprite.x - KNIFE_HITBOX_W / 2, this._sprite.y - KNIFE_HITBOX_H / 2,
        KNIFE_HITBOX_W, KNIFE_HITBOX_H,
        r.x, r.y, r.w, r.h,
      )) {
        this._reflected = true;
        this._dirX = (this._dirX === 1 ? -1 : 1) as 1 | -1;
        return;
      }
    }
  }

  /**
   * After reflection, hit the thrower hurtbox on overlap.
   * @spec FR-EA-04
   */
  private _checkThrowerHit(): void {
    const hurtbox = this._combatSystem.getHurtbox(this._throwerId);
    if (!hurtbox) return;
    const r = hurtbox.rect;
    if (this._rectsOverlap(
      this._sprite.x - KNIFE_HITBOX_W / 2, this._sprite.y - KNIFE_HITBOX_H / 2,
      KNIFE_HITBOX_W, KNIFE_HITBOX_H,
      r.x, r.y, r.w, r.h,
    )) {
      const facing: 'left' | 'right' = this._dirX === 1 ? 'right' : 'left';
      this._combatSystem.dispatchHit(this._throwerId, {
        damage:         KNIFE_DAMAGE,
        knockbackX:     KNIFE_KNOCKBACK_X,
        knockbackY:     0,
        hitStunFrames:  KNIFE_HIT_STUN,
        attackerFacing: facing,
        teamTag:        'player',
        isGrab:         false,
        isAoe:          false,
      });
      this._done = true;
    }
  }

  private _rectsOverlap(
    ax: number, ay: number, aw: number, ah: number,
    bx: number, by: number, bw: number, bh: number,
  ): boolean {
    return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
  }
}
