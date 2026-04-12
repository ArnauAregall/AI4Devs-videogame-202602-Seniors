import { describe, it, expect } from 'vitest';
import * as HudConfig from '../hud/HudConfig';

describe('HudConfig', () => {
  it('exports health colour constants as numbers', () => {
    expect(typeof HudConfig.HUD_HEALTH_GREEN).toBe('number');
    expect(typeof HudConfig.HUD_HEALTH_YELLOW).toBe('number');
    expect(typeof HudConfig.HUD_HEALTH_RED).toBe('number');
  });

  it('yellow threshold is 0.5 and red threshold is 0.25', () => {
    expect(HudConfig.HUD_HEALTH_YELLOW_THRESHOLD).toBe(0.5);
    expect(HudConfig.HUD_HEALTH_RED_THRESHOLD).toBe(0.25);
  });

  it('timer warning is 30 seconds', () => {
    expect(HudConfig.HUD_TIMER_WARNING_SECONDS).toBe(30);
    expect(HudConfig.HUD_TIMER_START_SECONDS).toBe(180);
  });

  it('boss bar dimensions are numbers', () => {
    expect(typeof HudConfig.HUD_BOSS_BAR_Y).toBe('number');
    expect(typeof HudConfig.HUD_BOSS_BAR_WIDTH).toBe('number');
    expect(typeof HudConfig.HUD_BOSS_BAR_HEIGHT).toBe('number');
  });

  it('layout positions are numbers', () => {
    expect(typeof HudConfig.HUD_HEALTH_BAR_X).toBe('number');
    expect(typeof HudConfig.HUD_SCORE_X).toBe('number');
    expect(typeof HudConfig.HUD_LIVES_X).toBe('number');
    expect(typeof HudConfig.HUD_TIMER_X).toBe('number');
    expect(typeof HudConfig.HUD_COMBO_X).toBe('number');
    expect(typeof HudConfig.HUD_SPECIAL_X).toBe('number');
  });

  it('font constants are strings', () => {
    expect(typeof HudConfig.HUD_FONT_FAMILY).toBe('string');
    expect(typeof HudConfig.HUD_FONT_SIZE_SMALL).toBe('string');
    expect(typeof HudConfig.HUD_FONT_SIZE_NORMAL).toBe('string');
    expect(typeof HudConfig.HUD_FONT_SIZE_LARGE).toBe('string');
  });

  it('combo minimum count is 2', () => {
    expect(HudConfig.HUD_COMBO_MIN_COUNT).toBe(2);
  });

  it('max continues is 3', () => {
    expect(HudConfig.HUD_MAX_CONTINUES).toBe(3);
  });

  it('leaderboard constants are correct types', () => {
    expect(typeof HudConfig.HUD_LEADERBOARD_MAX_ENTRIES).toBe('number');
    expect(typeof HudConfig.HUD_LEADERBOARD_NAME_MAX_LENGTH).toBe('number');
    expect(typeof HudConfig.HUD_LEADERBOARD_STORAGE_KEY).toBe('string');
  });

  it('score per archetype are positive numbers', () => {
    expect(HudConfig.HUD_SCORE_BRAWLER).toBeGreaterThan(0);
    expect(HudConfig.HUD_SCORE_RUSHER).toBeGreaterThan(HudConfig.HUD_SCORE_BRAWLER);
    expect(HudConfig.HUD_SCORE_KNIFE_THROWER).toBeGreaterThan(HudConfig.HUD_SCORE_RUSHER);
    expect(HudConfig.HUD_SCORE_BOSS).toBeGreaterThan(HudConfig.HUD_SCORE_KNIFE_THROWER);
  });
});
