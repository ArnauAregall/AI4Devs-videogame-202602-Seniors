/**
 * Rectangular vulnerable region for a damageable character.
 * Registered/removed with CombatSystem; excluded from overlap checks while invincible.
 *
 * @spec hurtbox-component
 */
export interface HurtboxRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export class HurtboxComponent {
  readonly id: string;
  readonly teamTag: string;
  rect: HurtboxRect;
  invincible: boolean = false;

  constructor(id: string, rect: HurtboxRect, teamTag: string) {
    this.id      = id;
    this.rect    = { ...rect };
    this.teamTag = teamTag;
  }

  /**
   * Reposition the hurtbox to track the character's current world position.
   * Typically called each fixed tick before CombatSystem runs its loop.
   */
  update(centerX: number, centerY: number): void {
    this.rect.x = centerX - this.rect.w / 2;
    this.rect.y = centerY - this.rect.h / 2;
  }
}
