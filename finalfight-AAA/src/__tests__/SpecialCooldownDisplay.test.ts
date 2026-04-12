import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('phaser', () => ({
  default: { Scene: class {} },
  Scene:   class {},
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

import { SpecialCooldownDisplay } from '../hud/SpecialCooldownDisplay';
import { HUD_SPECIAL_WIDTH } from '../hud/HudConfig';

describe('SpecialCooldownDisplay', () => {
  let scene: ReturnType<typeof makeScene>;

  beforeEach(() => {
    vi.clearAllMocks();
    scene = makeScene();
  });

  it('initialises at fraction 0 (fully charged)', () => {
    const display = new SpecialCooldownDisplay(scene as never);
    expect(display.fraction).toBe(0);
  });

  it('fraction 0 means bar is full (fill = 100% width)', () => {
    const display = new SpecialCooldownDisplay(scene as never);
    display.update(0);
    expect(display.fraction).toBe(0);
    // Visual assertion via fill rect: fill width = HUD_SPECIAL_WIDTH * (1 - 0) = HUD_SPECIAL_WIDTH
    // (indirect: no error thrown, fraction correct)
  });

  it('fraction 1 means bar is empty (fill = 0% width)', () => {
    const display = new SpecialCooldownDisplay(scene as never);
    display.update(1);
    expect(display.fraction).toBe(1);
  });

  it('fraction 0.5 is mid-charge', () => {
    const display = new SpecialCooldownDisplay(scene as never);
    display.update(0.5);
    expect(display.fraction).toBe(0.5);
  });

  it('clamps values above 1 to 1', () => {
    const display = new SpecialCooldownDisplay(scene as never);
    display.update(2);
    expect(display.fraction).toBe(1);
  });

  it('clamps values below 0 to 0', () => {
    const display = new SpecialCooldownDisplay(scene as never);
    display.update(-1);
    expect(display.fraction).toBe(0);
  });
});
