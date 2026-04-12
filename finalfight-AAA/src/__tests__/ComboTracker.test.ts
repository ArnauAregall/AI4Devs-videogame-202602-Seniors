import { describe, it, expect, beforeEach } from 'vitest';
import { ComboTracker } from '../combat/ComboTracker';
import {
  COMBO_WINDOW_FRAMES,
  DIMINISHING_MIN_FACTOR,
  DAMAGE_FLOOR,
  HIT_STUN_COMBO_INCREMENT,
  HIT_STUN_MAX_FRAMES,
} from '../combat/CombatConfig';

describe('ComboTracker', () => {
  let tracker: ComboTracker;
  const BASE_DAMAGE    = 20;
  const BASE_HIT_STUN  = 10;

  beforeEach(() => {
    tracker = new ComboTracker();
  });

  // ── Combo counter ────────────────────────────────────────────────────────

  it('first hit sets combo counter to 1', () => {
    const result = tracker.recordHit('e1', BASE_DAMAGE, BASE_HIT_STUN);
    expect(result.comboCount).toBe(1);
  });

  it('second hit within window increments counter to 2', () => {
    tracker.recordHit('e1', BASE_DAMAGE, BASE_HIT_STUN);
    const result = tracker.recordHit('e1', BASE_DAMAGE, BASE_HIT_STUN);
    expect(result.comboCount).toBe(2);
  });

  it('hit after window expires resets counter to 1', () => {
    tracker.recordHit('e1', BASE_DAMAGE, BASE_HIT_STUN);
    // Advance past the combo window
    for (let i = 0; i < COMBO_WINDOW_FRAMES + 1; i++) {
      tracker.tick();
    }
    const result = tracker.recordHit('e1', BASE_DAMAGE, BASE_HIT_STUN);
    expect(result.comboCount).toBe(1);
  });

  it('window timer resets on each hit within the window', () => {
    tracker.recordHit('e1', BASE_DAMAGE, BASE_HIT_STUN);
    // Advance almost to window expiry
    for (let i = 0; i < COMBO_WINDOW_FRAMES - 1; i++) {
      tracker.tick();
    }
    // Hit again — timer should reset
    tracker.recordHit('e1', BASE_DAMAGE, BASE_HIT_STUN);
    // Advance almost to expiry again (should NOT expire since we just reset)
    for (let i = 0; i < COMBO_WINDOW_FRAMES - 1; i++) {
      tracker.tick();
    }
    const result = tracker.recordHit('e1', BASE_DAMAGE, BASE_HIT_STUN);
    expect(result.comboCount).toBe(3);
  });

  // ── Diminishing returns ──────────────────────────────────────────────────

  it('first hit deals full base damage', () => {
    const result = tracker.recordHit('e1', BASE_DAMAGE, BASE_HIT_STUN);
    expect(result.effectiveDamage).toBe(BASE_DAMAGE);
  });

  it('second hit deals 90% of base damage', () => {
    tracker.recordHit('e1', BASE_DAMAGE, BASE_HIT_STUN);
    const result = tracker.recordHit('e1', BASE_DAMAGE, BASE_HIT_STUN);
    expect(result.effectiveDamage).toBe(Math.floor(BASE_DAMAGE * 0.9));
  });

  it('third hit deals 80% of base damage', () => {
    tracker.recordHit('e1', BASE_DAMAGE, BASE_HIT_STUN);
    tracker.recordHit('e1', BASE_DAMAGE, BASE_HIT_STUN);
    const result = tracker.recordHit('e1', BASE_DAMAGE, BASE_HIT_STUN);
    expect(result.effectiveDamage).toBe(Math.floor(BASE_DAMAGE * 0.8));
  });

  it('damage is capped at DIMINISHING_MIN_FACTOR for deep combos', () => {
    for (let i = 0; i < 10; i++) {
      tracker.recordHit('e1', BASE_DAMAGE, BASE_HIT_STUN);
    }
    const result = tracker.recordHit('e1', BASE_DAMAGE, BASE_HIT_STUN);
    const expected = Math.max(DAMAGE_FLOOR, Math.floor(BASE_DAMAGE * DIMINISHING_MIN_FACTOR));
    expect(result.effectiveDamage).toBe(expected);
  });

  it('effective damage never goes below DAMAGE_FLOOR', () => {
    const tinyDamage = 1;
    for (let i = 0; i < 20; i++) {
      const result = tracker.recordHit('e1', tinyDamage, BASE_HIT_STUN);
      expect(result.effectiveDamage).toBeGreaterThanOrEqual(DAMAGE_FLOOR);
    }
  });

  // ── Hit-stun scaling ─────────────────────────────────────────────────────

  it('first hit stun equals base + 1 * increment', () => {
    const result = tracker.recordHit('e1', BASE_DAMAGE, BASE_HIT_STUN);
    expect(result.effectiveHitStun).toBe(BASE_HIT_STUN + 1 * HIT_STUN_COMBO_INCREMENT);
  });

  it('second hit stun equals base + 2 * increment', () => {
    tracker.recordHit('e1', BASE_DAMAGE, BASE_HIT_STUN);
    const result = tracker.recordHit('e1', BASE_DAMAGE, BASE_HIT_STUN);
    expect(result.effectiveHitStun).toBe(BASE_HIT_STUN + 2 * HIT_STUN_COMBO_INCREMENT);
  });

  it('hit stun is capped at HIT_STUN_MAX_FRAMES', () => {
    // Drive the combo deep enough to exceed the cap
    const highBase = HIT_STUN_MAX_FRAMES;
    for (let i = 0; i < 30; i++) {
      tracker.recordHit('e1', BASE_DAMAGE, highBase);
    }
    const result = tracker.recordHit('e1', BASE_DAMAGE, highBase);
    expect(result.effectiveHitStun).toBe(HIT_STUN_MAX_FRAMES);
  });

  // ── Multiple targets ─────────────────────────────────────────────────────

  it('tracks combo counters independently per target', () => {
    tracker.recordHit('e1', BASE_DAMAGE, BASE_HIT_STUN);
    tracker.recordHit('e1', BASE_DAMAGE, BASE_HIT_STUN);
    const resultE2 = tracker.recordHit('e2', BASE_DAMAGE, BASE_HIT_STUN);
    expect(resultE2.comboCount).toBe(1);
  });

  // ── Reset ────────────────────────────────────────────────────────────────

  it('reset clears all tracked combos', () => {
    tracker.recordHit('e1', BASE_DAMAGE, BASE_HIT_STUN);
    tracker.reset();
    const result = tracker.recordHit('e1', BASE_DAMAGE, BASE_HIT_STUN);
    expect(result.comboCount).toBe(1);
  });
});
