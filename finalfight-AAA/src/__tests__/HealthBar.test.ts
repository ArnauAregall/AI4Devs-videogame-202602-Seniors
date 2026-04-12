import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('phaser', () => ({
  default: { Scene: class {} },
  Scene:   class {},
}));

function makeGraphicsMock() {
  const g = {
    clear:     vi.fn().mockReturnThis(),
    fillStyle: vi.fn().mockReturnThis(),
    fillRect:  vi.fn().mockReturnThis(),
    setDepth:  vi.fn().mockReturnThis(),
    setVisible: vi.fn().mockReturnThis(),
  };
  return g;
}

function makeScene() {
  const graphicsList: ReturnType<typeof makeGraphicsMock>[] = [];
  const scene = {
    add: {
      graphics: vi.fn(() => {
        const g = makeGraphicsMock();
        graphicsList.push(g);
        return g;
      }),
    },
  };
  return { scene, graphicsList };
}

import { HealthBar } from '../hud/HealthBar';
import {
  HUD_HEALTH_GREEN, HUD_HEALTH_YELLOW, HUD_HEALTH_RED,
  HUD_HEALTH_YELLOW_THRESHOLD, HUD_HEALTH_RED_THRESHOLD,
} from '../hud/HudConfig';

describe('HealthBar', () => {
  let scene: ReturnType<typeof makeScene>['scene'];

  beforeEach(() => {
    vi.clearAllMocks();
    ({ scene } = makeScene());
  });

  it('starts with the initial fraction', () => {
    const bar = new HealthBar(scene as never, 75, 100);
    expect(bar.fraction).toBeCloseTo(0.75);
  });

  it('returns green colour above yellow threshold', () => {
    const bar = new HealthBar(scene as never, 100, 100);
    expect(bar.fillColour).toBe(HUD_HEALTH_GREEN);
  });

  it('returns yellow colour between red and yellow thresholds', () => {
    // fraction = 0.4 → below 0.5 but above 0.25
    const bar = new HealthBar(scene as never, 40, 100);
    expect(bar.fillColour).toBe(HUD_HEALTH_YELLOW);
  });

  it('returns red colour at or below red threshold', () => {
    const bar = new HealthBar(scene as never, 25, 100);
    expect(bar.fillColour).toBe(HUD_HEALTH_RED);
  });

  it('clamps fraction to 0 when current is negative', () => {
    const bar = new HealthBar(scene as never, -10, 100);
    expect(bar.fraction).toBe(0);
    expect(bar.fillColour).toBe(HUD_HEALTH_RED);
  });

  it('fraction is exactly 1 at full health', () => {
    const bar = new HealthBar(scene as never, 100, 100);
    expect(bar.fraction).toBe(1);
  });

  it('update changes fraction and colour', () => {
    const bar = new HealthBar(scene as never, 100, 100);
    bar.update(20, 100);
    expect(bar.fraction).toBeCloseTo(0.2);
    expect(bar.fillColour).toBe(HUD_HEALTH_RED);
  });

  it('does not redraw when values are unchanged', () => {
    const { scene: s, graphicsList } = makeScene();
    const bar = new HealthBar(s as never, 50, 100);
    const initialClearCount = graphicsList[0].clear.mock.calls.length;
    bar.update(50, 100); // same values
    expect(graphicsList[0].clear.mock.calls.length).toBe(initialClearCount);
  });

  it('boundary: fraction exactly at HUD_HEALTH_YELLOW_THRESHOLD', () => {
    const bar = new HealthBar(scene as never, Math.round(HUD_HEALTH_YELLOW_THRESHOLD * 100), 100);
    // fraction == threshold → NOT above → yellow
    expect(bar.fillColour).toBe(HUD_HEALTH_YELLOW);
  });

  it('boundary: fraction exactly at HUD_HEALTH_RED_THRESHOLD', () => {
    const bar = new HealthBar(scene as never, Math.round(HUD_HEALTH_RED_THRESHOLD * 100), 100);
    // fraction == threshold → NOT above → red
    expect(bar.fillColour).toBe(HUD_HEALTH_RED);
  });
});
