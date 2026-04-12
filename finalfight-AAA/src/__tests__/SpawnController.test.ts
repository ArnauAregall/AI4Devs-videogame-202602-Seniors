import { describe, it, expect, vi, beforeEach } from 'vitest';

const mocks = vi.hoisted(() => {
  const timerCallbacks: Array<{ delay: number; callback: () => void }> = [];

  const sceneMock = {
    registerFixedUpdate:   vi.fn(),
    unregisterFixedUpdate: vi.fn(),
    events: {
      emit: vi.fn(),
      on: vi.fn(),
      off: vi.fn(),
    },
    time: {
      addEvent: vi.fn((cfg: { delay: number; callback: () => void }) => {
        timerCallbacks.push(cfg);
        return { remove: vi.fn() };
      }),
    },
  };

  return { sceneMock, timerCallbacks };
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
import { SpawnController } from '../stage/SpawnController';
import type { SpawnZoneData } from '../stage/StageData';

const ZONE_DATA: SpawnZoneData = {
  id: 'zone-test',
  entries: [
    { archetype: 'punk', count: 2, staggerDelayMs: 500 },
    { archetype: 'punk', count: 1, staggerDelayMs: 800 },
  ],
};

describe('SpawnController', () => {
  let ctrl: SpawnController;
  let enemyDefeatedHandler: () => void;

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.timerCallbacks.length = 0;
    mocks.sceneMock.events.on.mockImplementation((event: string, fn: () => void) => {
      if (event === 'enemyDefeated') enemyDefeatedHandler = fn;
    });
    ctrl = new SpawnController(
      mocks.sceneMock as unknown as Parameters<typeof SpawnController>[0],
      ZONE_DATA,
    );
  });

  it('is not cleared before activation', () => {
    expect(ctrl.isCleared).toBe(false);
  });

  it('schedules one timer event per enemy', () => {
    ctrl.activate(0);
    const totalEnemies = ZONE_DATA.entries.reduce((s, e) => s + e.count, 0);
    expect(mocks.sceneMock.time.addEvent).toHaveBeenCalledTimes(totalEnemies);
  });

  it('emits enemySpawn event for each timer callback', () => {
    ctrl.activate(0);
    for (const cb of mocks.timerCallbacks) cb.callback();
    const spawnCalls = mocks.sceneMock.events.emit.mock.calls.filter(
      (args: unknown[]) => args[0] === 'enemySpawn',
    );
    expect(spawnCalls).toHaveLength(mocks.timerCallbacks.length);
  });

  it('spawn X is off screen to the right', () => {
    const cameraX = 100;
    ctrl.activate(cameraX);
    mocks.timerCallbacks[0].callback();
    const call = mocks.sceneMock.events.emit.mock.calls.find(
      (args: unknown[]) => args[0] === 'enemySpawn',
    );
    const payload = call?.[1] as { x: number };
    expect(payload.x).toBeGreaterThan(cameraX + GameConfig.CANVAS_WIDTH);
  });

  it('emits zoneCleared after all enemies defeated', () => {
    ctrl.activate(0);
    const totalEnemies = ZONE_DATA.entries.reduce((s, e) => s + e.count, 0);
    for (let i = 0; i < totalEnemies; i++) {
      enemyDefeatedHandler();
    }
    const cleared = mocks.sceneMock.events.emit.mock.calls.some(
      (args: unknown[]) => args[0] === 'zoneCleared',
    );
    expect(cleared).toBe(true);
    expect(ctrl.isCleared).toBe(true);
  });

  it('does not emit zoneCleared prematurely', () => {
    ctrl.activate(0);
    const totalEnemies = ZONE_DATA.entries.reduce((s, e) => s + e.count, 0);
    for (let i = 0; i < totalEnemies - 1; i++) {
      enemyDefeatedHandler();
    }
    const cleared = mocks.sceneMock.events.emit.mock.calls.some(
      (args: unknown[]) => args[0] === 'zoneCleared',
    );
    expect(cleared).toBe(false);
    expect(ctrl.isCleared).toBe(false);
  });

  it('does not activate twice', () => {
    ctrl.activate(0);
    const firstCount = mocks.sceneMock.time.addEvent.mock.calls.length;
    ctrl.activate(0);
    expect(mocks.sceneMock.time.addEvent).toHaveBeenCalledTimes(firstCount);
  });

  it('removes enemyDefeated listener on destroy()', () => {
    ctrl.destroy();
    expect(mocks.sceneMock.events.off).toHaveBeenCalledWith('enemyDefeated', expect.any(Function));
  });
});
