/**
 * Central hit-detection engine for the combat system.
 *
 * Per-tick responsibilities:
 *  1. Advance ComboTracker window timers.
 *  2. Test every active hitbox against every active hurtbox of the opposing team.
 *  3. Enforce one-hit-per-swing guard.
 *  4. Compute effective damage/stun via ComboTracker and dispatch HitEvent to listeners.
 *
 * Grab attacks are routed through `tryGrab()` which performs a proximity check
 * instead of hitbox-hurtbox overlap.
 *
 * @spec combat-system
 * @implements FR-CS-01 through FR-CS-21, NFR-CS-01 through NFR-CS-04
 */
import { HitEvent } from './HitEvent';
import { HurtboxComponent, HurtboxRect } from './HurtboxComponent';
import { ComboTracker } from './ComboTracker';
import {
  GRAB_RANGE,
  GRAB_HEIGHT_TOLERANCE,
  PLAYER_GRAB_DAMAGE,
  PLAYER_LIGHT_KNOCKBACK_X,
  PLAYER_LIGHT_KNOCKBACK_Y,
  LIGHT_HIT_STUN_FRAMES,
} from './CombatConfig';

export interface HitboxEntry {
  id: string;
  rect: HurtboxRect;
  teamTag: string;
  damage: number;
  knockbackX: number;
  knockbackY: number;
  hitStunFrames: number;
  facing: 'left' | 'right';
  isAoe: boolean;
}

/** Callback invoked whenever a hit is resolved. */
export type OnHitCallback = (targetId: string, event: HitEvent) => void;

export class CombatSystem {
  private readonly _hitboxes: Map<string, HitboxEntry>      = new Map();
  private readonly _hurtboxes: Map<string, HurtboxComponent> = new Map();
  /**
   * Tracks (hitboxId::targetId) pairs that have already connected this swing.
   * Cleared when a hitbox is removed. AoE hitboxes use the same guard.
   */
  private readonly _hitGuard: Set<string>                   = new Set();
  private readonly _comboTracker: ComboTracker               = new ComboTracker();
  private readonly _onHitListeners: Set<OnHitCallback>      = new Set();

  // ── Registration ────────────────────────────────────────────────────────

  registerHitbox(
    id: string,
    rect: HurtboxRect,
    teamTag: string,
    damage: number,
    knockbackX: number,
    knockbackY: number,
    hitStunFrames: number,
    facing: 'left' | 'right',
    isAoe = false,
  ): void {
    this._hitboxes.set(id, { id, rect: { ...rect }, teamTag, damage, knockbackX, knockbackY, hitStunFrames, facing, isAoe });
  }

  removeHitbox(id: string): void {
    this._hitboxes.delete(id);
    // Clear guard entries for this hitbox so next swing is clean
    for (const key of this._hitGuard) {
      if (key.startsWith(id + '::')) this._hitGuard.delete(key);
    }
  }

  registerHurtbox(id: string, rect: HurtboxRect, teamTag: string): void {
    this._hurtboxes.set(id, new HurtboxComponent(id, rect, teamTag));
  }

  removeHurtbox(id: string): void {
    this._hurtboxes.delete(id);
  }

  getHurtbox(id: string): HurtboxComponent | undefined {
    return this._hurtboxes.get(id);
  }

  /** Subscribe to resolved hit events. */
  onHit(cb: OnHitCallback): void {
    this._onHitListeners.add(cb);
  }

  offHit(cb: OnHitCallback): void {
    this._onHitListeners.delete(cb);
  }

  // ── Fixed-tick ───────────────────────────────────────────────────────────

  /**
   * Run one fixed-update step: advance combo timers then resolve overlaps.
   * @spec NFR-CS-01
   */
  fixedUpdate(): void {
    this._comboTracker.tick();
    this._resolveOverlaps();
  }

  // ── Grab ─────────────────────────────────────────────────────────────────

  /**
   * Proximity grab check. Returns a resolved HitEvent or null.
   * On success, marks the attacker's hurtbox invincible for GRAB_INVINCIBILITY_FRAMES.
   *
   * @spec combat-system – Requirement: Grab proximity check
   */
  tryGrab(
    attackerId: string,
    attackerX: number,
    attackerY: number,
    facing: 'left' | 'right',
  ): HitEvent | null {
    const attackerTeam = this._hurtboxes.get(attackerId)?.teamTag ?? 'player';
    let target: HurtboxComponent | null = null;

    for (const hb of this._hurtboxes.values()) {
      if (hb.invincible)        continue;
      if (hb.teamTag === attackerTeam) continue;

      const hbCX = hb.rect.x + hb.rect.w / 2;
      const hbCY = hb.rect.y + hb.rect.h / 2;
      const dx = Math.abs(attackerX - hbCX);
      const dy = Math.abs(attackerY - hbCY);

      if (dx < GRAB_RANGE && dy < GRAB_HEIGHT_TOLERANCE) {
        target = hb;
        break;
      }
    }

    if (!target) return null;

    // Grant invincibility to attacker
    const attackerHb = this._hurtboxes.get(attackerId);
    if (attackerHb) {
      attackerHb.invincible = true;
      // Invincibility is cleared externally after GRAB_INVINCIBILITY_FRAMES ticks
      // (PlayerController manages the countdown)
    }

    const { effectiveDamage, effectiveHitStun } = this._comboTracker.recordHit(
      target.id,
      PLAYER_GRAB_DAMAGE,
      LIGHT_HIT_STUN_FRAMES,
    );

    const event: HitEvent = {
      damage:          effectiveDamage,
      knockbackX:      PLAYER_LIGHT_KNOCKBACK_X,
      knockbackY:      PLAYER_LIGHT_KNOCKBACK_Y,
      hitStunFrames:   effectiveHitStun,
      attackerFacing:  facing,
      teamTag:         attackerTeam,
      isGrab:          true,
      isAoe:           false,
    };

    this._dispatch(target.id, event);
    return event;
  }

  // ── Accessors for DebugRenderer ───────────────────────────────────────────

  getHitboxes(): ReadonlyMap<string, HitboxEntry> {
    return this._hitboxes;
  }

  getHurtboxes(): ReadonlyMap<string, HurtboxComponent> {
    return this._hurtboxes;
  }

  // ── Private ───────────────────────────────────────────────────────────────

  private _resolveOverlaps(): void {
    // Snapshot to avoid mutation-during-iteration issues
    const hitboxes  = Array.from(this._hitboxes.values());
    const hurtboxes = Array.from(this._hurtboxes.values());

    for (const hx of hitboxes) {
      for (const hz of hurtboxes) {
        // Team filter
        if (hx.teamTag === hz.teamTag) continue;
        // Invincibility
        if (hz.invincible) continue;

        // One-hit-per-swing guard (skipped for AoE? No — AoE still only hits each target once per activation)
        const guardKey = `${hx.id}::${hz.id}`;
        if (this._hitGuard.has(guardKey)) continue;

        if (this._rectsOverlap(hx.rect, hz.rect)) {
          this._hitGuard.add(guardKey);

          const { effectiveDamage, effectiveHitStun } = this._comboTracker.recordHit(
            hz.id,
            hx.damage,
            hx.hitStunFrames,
          );

          // Knockback direction: negate X when facing left
          const kbX = hx.facing === 'left' ? -hx.knockbackX : hx.knockbackX;

          const event: HitEvent = {
            damage:         effectiveDamage,
            knockbackX:     kbX,
            knockbackY:     hx.knockbackY,
            hitStunFrames:  effectiveHitStun,
            attackerFacing: hx.facing,
            teamTag:        hx.teamTag,
            isGrab:         false,
            isAoe:          hx.isAoe,
          };

          this._dispatch(hz.id, event);
        }
      }
    }
  }

  private _rectsOverlap(a: HurtboxRect, b: HurtboxRect): boolean {
    return (
      a.x < b.x + b.w &&
      a.x + a.w > b.x &&
      a.y < b.y + b.h &&
      a.y + a.h > b.y
    );
  }

  private _dispatch(targetId: string, event: HitEvent): void {
    for (const cb of this._onHitListeners) {
      cb(targetId, event);
    }
  }
}
