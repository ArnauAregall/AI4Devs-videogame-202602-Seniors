import { describe, it, expect, vi, beforeEach } from 'vitest';

const mocks = vi.hoisted(() => {
  const sceneMock = {
    registerFixedUpdate:   vi.fn(),
    unregisterFixedUpdate: vi.fn(),
    events: { emit: vi.fn(), on: vi.fn(), off: vi.fn() },
    scale: { width: 384, height: 224 },
    cameras: { main: { scrollX: 0 } },
  };
  return { sceneMock };
});

vi.mock('phaser', () => ({
  default: {
    Scene: class {},
    AUTO: 0,
    Scale: { FIT: 'FIT', NONE: 'NONE', CENTER_BOTH: 'CENTER_BOTH' },
  },
  Scene: class {},
}));

import { GameConfig } from '../config/GameConfig';
import { StageTimer } from '../stage/StageTimer';

describe('StageTimer', () => {
  let timer: StageTimer;
  let registeredCallback: (dt: number) => void;

  const TOTAL_TICKS = 180 * GameConfig.TARGET_FPS;

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.sceneMock.registerFixedUpdate.mockImplementation((fn: (dt: number) => void) => {
      registeredCallback = fn;
    });
    timer = new StageTimer(mocks.sceneMock as unknown as Parameters<typeof StageTimer>[0]);
  });

  it('starts at 180 × TARGET_FPS ticks', () => {
    expect(timer.ticksRemaining).toBe(TOTAL_TICKS);
  });

  it('secondsRemaining returns full 180 seconds at start', () => {
    expect(timer.secondsRemaining).toBe(180);
  });

  it('decrements by 1 each fixed tick', () => {
    registeredCallback(GameConfig.FIXED_DELTA_MS);
    expect(timer.ticksRemaining).toBe(TOTAL_TICKS - 1);
  });

  it('secondsRemaining floors correctly', () => {
    // Fire TARGET_FPS - 1 ticks → still 179 full seconds
    for (let i = 0; i < GameConfig.TARGET_FPS - 1; i++) {
      registeredCallback(GameConfig.FIXED_DELTA_MS);
    }
    expect(timer.secondsRemaining).toBe(179);
  });

  it('emits timeUp event when ticks reach zero', () => {
    for (let i = 0; i < TOTAL_TICKS; i++) {
      registeredCallback(GameConfig.FIXED_DELTA_MS);
    }
    expect(mocks.sceneMock.events.emit).toHaveBeenCalledWith('timeUp');
  });

  it('does not emit timeUp more than once', () => {
    for (let i = 0; i < TOTAL_TICKS + 5; i++) {
      registeredCallback(GameConfig.FIXED_DELTA_MS);
    }
    const timeUpCalls = mocks.sceneMock.events.emit.mock.calls.filter(
      (args: unknown[]) => args[0] === 'timeUp',
    );
    expect(timeUpCalls).toHaveLength(1);
  });

  it('ticksRemaining does not go below 0', () => {
    for (let i = 0; i < TOTAL_TICKS + 10; i++) {
      registeredCallback(GameConfig.FIXED_DELTA_MS);
    }
    expect(timer.ticksRemaining).toBe(0);
  });

  it('stop() prevents timeUp from firing', () => {
    timer.stop();
    for (let i = 0; i < TOTAL_TICKS; i++) {
      registeredCallback(GameConfig.FIXED_DELTA_MS);
    }
    expect(mocks.sceneMock.events.emit).not.toHaveBeenCalledWith('timeUp');
  });

  it('registers fixedUpdate callback on construction', () => {
    expect(mocks.sceneMock.registerFixedUpdate).toHaveBeenCalledOnce();
  });

  it('unregisters callback on destroy()', () => {
    timer.destroy();
    expect(mocks.sceneMock.unregisterFixedUpdate).toHaveBeenCalledOnce();
  });
});
