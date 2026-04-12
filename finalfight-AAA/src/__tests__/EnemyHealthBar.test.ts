import { describe, it, expect, vi, beforeEach } from 'vitest';

// @spec FR-EB-20 FR-EB-21 FR-EB-22 FR-EB-23 FR-EB-24 FR-EB-25 FR-EB-26 FR-EB-27

// Phaser mock — must be hoisted before any Phaser-dependent import
const mocks = vi.hoisted(() => {
  const graphicsMock = {
    setDepth: vi.fn().mockReturnThis(),
    clear:    vi.fn().mockReturnThis(),
    fillStyle: vi.fn().mockReturnThis(),
    fillRect:  vi.fn().mockReturnThis(),
    destroy:   vi.fn(),
  };
  const sceneMock = {
    add: { graphics: vi.fn(() => graphicsMock) },
  };
  return { sceneMock, graphicsMock };
});

vi.mock('phaser', () => ({
  default: { Scene: class {}, Scale: { FIT: 'FIT', NONE: 'NONE', CENTER_BOTH: 'CENTER_BOTH' } },
  Scene:   class {},
}));

import type Phaser from 'phaser';
import { EnemyHealthBar, COLOR_HIGH, COLOR_LOW, BAR_WIDTH } from '../enemy/EnemyHealthBar';

function makeBar() {
  return new EnemyHealthBar(mocks.sceneMock as unknown as Phaser.Scene);
}

describe('EnemyHealthBar', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  // ── FR-EB-20: Health bar is created for each enemy ───────────────────────

  it('creates a graphics object on construction', () => {
    makeBar();
    expect(mocks.sceneMock.add.graphics).toHaveBeenCalledOnce();
  });

  it('sets depth on the graphics object', () => {
    makeBar();
    expect(mocks.graphicsMock.setDepth).toHaveBeenCalledOnce();
  });

  // ── FR-EB-21: Bar dimensions and position ────────────────────────────────

  it('draws background track and filled bar on update', () => {
    const bar = makeBar();
    bar.update(50, 100, 200, 300);
    expect(mocks.graphicsMock.fillRect).toHaveBeenCalledTimes(2); // track + fill
  });

  it('clears previous frame before redrawing', () => {
    const bar = makeBar();
    bar.update(50, 100, 200, 300);
    expect(mocks.graphicsMock.clear).toHaveBeenCalledOnce();
  });

  // ── FR-EB-22: Bar fill is proportional to HP ────────────────────────────

  it('full HP renders full fill width equal to track width', () => {
    const bar = makeBar();
    bar.update(100, 100, 0, 0);
    const calls = mocks.graphicsMock.fillRect.mock.calls;
    const fillWidth  = calls[1][2];
    expect(fillWidth).toBeCloseTo(BAR_WIDTH, 0);
  });

  it('half HP renders fill width approximately half the track width', () => {
    const bar = makeBar();
    bar.update(50, 100, 0, 0);
    const calls = mocks.graphicsMock.fillRect.mock.calls;
    const trackWidth = calls[0][2];
    const fillWidth  = calls[1][2];
    expect(fillWidth).toBeCloseTo(trackWidth / 2, 1);
  });

  it('zero HP renders zero fill width', () => {
    const bar = makeBar();
    bar.update(0, 100, 0, 0);
    const fillWidth = mocks.graphicsMock.fillRect.mock.calls[1][2];
    expect(fillWidth).toBe(0);
  });

  // ── FR-EB-23 & 24: Colour thresholds ─────────────────────────────────────

  it('uses green colour (COLOR_HIGH) at full HP', () => {
    const bar = makeBar();
    bar.update(100, 100, 0, 0);
    // fillStyle calls: [0]=track, [1]=bar fill
    const fillColor = mocks.graphicsMock.fillStyle.mock.calls[1]?.[0];
    expect(fillColor).toBe(COLOR_HIGH);
  });

  it('uses red colour (COLOR_LOW) at low HP (≤25%)', () => {
    const bar = makeBar();
    bar.update(10, 100, 0, 0);
    const fillColor = mocks.graphicsMock.fillStyle.mock.calls[1]?.[0];
    expect(fillColor).toBe(COLOR_LOW);
  });

  // ── FR-EB-26: destroy removes graphics object ─────────────────────────────

  it('destroy() calls graphics.destroy()', () => {
    const bar = makeBar();
    bar.destroy();
    expect(mocks.graphicsMock.destroy).toHaveBeenCalledOnce();
  });

  it('calling destroy() twice does not throw', () => {
    const bar = makeBar();
    bar.destroy();
    expect(() => bar.destroy()).not.toThrow();
  });
});
