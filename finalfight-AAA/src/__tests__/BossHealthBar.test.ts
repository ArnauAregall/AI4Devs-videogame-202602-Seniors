import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('phaser', () => ({
  default: { Scene: class {} },
  Scene:   class {},
}));

// Mock GameConfig so BossHealthBar doesn't need canvas
vi.mock('../config/GameConfig', () => ({
  GameConfig: { CANVAS_WIDTH: 384, CANVAS_HEIGHT: 224 },
}));

function makeGraphicsMock() {
  return {
    clear:      vi.fn().mockReturnThis(),
    fillStyle:  vi.fn().mockReturnThis(),
    fillRect:   vi.fn().mockReturnThis(),
    setDepth:   vi.fn().mockReturnThis(),
    setVisible: vi.fn().mockReturnThis(),
  };
}

function makeScene() {
  return {
    add: { graphics: vi.fn(() => makeGraphicsMock()) },
  };
}

import { BossHealthBar } from '../hud/BossHealthBar';
import { HUD_HEALTH_GREEN, HUD_HEALTH_RED } from '../hud/HudConfig';

describe('BossHealthBar', () => {
  let scene: ReturnType<typeof makeScene>;

  beforeEach(() => {
    vi.clearAllMocks();
    scene = makeScene();
  });

  it('is hidden by default', () => {
    const bar = new BossHealthBar(scene as never);
    expect(bar.visible).toBe(false);
  });

  it('becomes visible after show()', () => {
    const bar = new BossHealthBar(scene as never);
    bar.show(100);
    expect(bar.visible).toBe(true);
  });

  it('fraction is 1 immediately after show()', () => {
    const bar = new BossHealthBar(scene as never);
    bar.show(200);
    expect(bar.fraction).toBe(1);
  });

  it('updates fraction on update()', () => {
    const bar = new BossHealthBar(scene as never);
    bar.show(100);
    bar.update(50, 100);
    expect(bar.fraction).toBeCloseTo(0.5);
  });

  it('becomes invisible after hide()', () => {
    const bar = new BossHealthBar(scene as never);
    bar.show(100);
    bar.hide();
    expect(bar.visible).toBe(false);
  });

  it('fraction 0 when current equals 0', () => {
    const bar = new BossHealthBar(scene as never);
    bar.show(100);
    bar.update(0, 100);
    expect(bar.fraction).toBe(0);
  });
});
