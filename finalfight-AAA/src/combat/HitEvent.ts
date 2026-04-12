/**
 * Immutable value type describing a single registered hit.
 * Created by CombatSystem when overlap or grab succeeds.
 *
 * @spec hit-event – Requirement: HitEvent value type definition
 */
export interface HitEvent {
  /** Raw damage before diminishing-returns adjustment. */
  readonly damage: number;
  /** Horizontal knockback magnitude (px). Always positive; sign applied by facing. */
  readonly knockbackX: number;
  /** Vertical knockback offset (px). Negative = upward. */
  readonly knockbackY: number;
  /** Base hit-stun before combo scaling. */
  readonly hitStunFrames: number;
  /** Direction attacker was facing; used to compute knockback direction. */
  readonly attackerFacing: 'left' | 'right';
  /** Team that dealt the hit ('player' or 'enemy'). */
  readonly teamTag: string;
  /** True when produced by a grab attack (bypassed hurtbox, throws at impact). */
  readonly isGrab: boolean;
  /** True when produced by an AoE attack (can hit multiple targets per swing). */
  readonly isAoe: boolean;
}
