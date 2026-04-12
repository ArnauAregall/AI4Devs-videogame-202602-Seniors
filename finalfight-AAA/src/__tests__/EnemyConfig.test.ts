import { describe, it, expect } from 'vitest';

// Pure constant tests — no Phaser dependency
import {
  KNOCKDOWN_THRESHOLD,
  DEATH_LINGER_FRAMES,
  ENEMY_SEPARATION_MIN_PX,
  MAX_SIMULTANEOUS_ATTACKERS,
  ENEMY_HURTBOX_W,
  ENEMY_HURTBOX_H,
  BRAWLER_MAX_HP,
  BRAWLER_PUNCH_DAMAGE,
  RUSHER_MAX_HP,
  KNIFE_THROWER_MAX_HP,
  BOSS_MAX_HP,
  BOSS_PHASE2_THRESHOLD,
  BOSS_PHASE3_THRESHOLD,
  KNIFE_MAX_RANGE,
  KNIFE_SPEED,
} from '../enemy/EnemyConfig';

describe('EnemyConfig — named constants', () => {
  it('KNOCKDOWN_THRESHOLD is positive and reasonable', () => {
    expect(KNOCKDOWN_THRESHOLD).toBeGreaterThan(0);
    expect(KNOCKDOWN_THRESHOLD).toBeLessThan(1000);
  });

  it('DEATH_LINGER_FRAMES is positive', () => {
    expect(DEATH_LINGER_FRAMES).toBeGreaterThan(0);
  });

  it('ENEMY_SEPARATION_MIN_PX > 0', () => {
    expect(ENEMY_SEPARATION_MIN_PX).toBeGreaterThan(0);
  });

  it('MAX_SIMULTANEOUS_ATTACKERS >= 1', () => {
    expect(MAX_SIMULTANEOUS_ATTACKERS).toBeGreaterThanOrEqual(1);
  });

  it('hurtbox dimensions are positive', () => {
    expect(ENEMY_HURTBOX_W).toBeGreaterThan(0);
    expect(ENEMY_HURTBOX_H).toBeGreaterThan(0);
  });

  it('archetype HP values are in ascending order of toughness', () => {
    expect(KNIFE_THROWER_MAX_HP).toBeLessThan(RUSHER_MAX_HP);
    expect(RUSHER_MAX_HP).toBeLessThan(BRAWLER_MAX_HP);
    expect(BRAWLER_MAX_HP).toBeLessThan(BOSS_MAX_HP);
  });

  it('boss phase thresholds make sense (phase3 < phase2)', () => {
    expect(BOSS_PHASE3_THRESHOLD).toBeLessThan(BOSS_PHASE2_THRESHOLD);
    expect(BOSS_PHASE2_THRESHOLD).toBeLessThan(1);
    expect(BOSS_PHASE3_THRESHOLD).toBeGreaterThan(0);
  });

  it('knife range > knife speed (projectile travels more than 1 tick)', () => {
    expect(KNIFE_MAX_RANGE).toBeGreaterThan(KNIFE_SPEED);
  });

  it('brawler punch damage is positive', () => {
    expect(BRAWLER_PUNCH_DAMAGE).toBeGreaterThan(0);
  });
});
