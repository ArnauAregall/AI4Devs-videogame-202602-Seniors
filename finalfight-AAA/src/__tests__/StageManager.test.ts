import { describe, it, expect, vi, beforeEach } from 'vitest';

const mocks = vi.hoisted(() => {
  const fadeOutCallbacks: Array<() => void> = [];
  const timerCallbacks: Array<{ delay: number; callback: () => void }> = [];

  const tileSpriteInstances: Array<{
    tilePositionX: number;
    setOrigin: ReturnType<typeof vi.fn>;
    setDepth: ReturnType<typeof vi.fn>;
    setScrollFactor: ReturnType<typeof vi.fn>;
    destroy: ReturnType<typeof vi.fn>;
  }> = [];

  const cameraMain = {
    scrollX: 0,
    fadeOut: vi.fn(),
    once: vi.fn((_event: string, cb: () => void) => { fadeOutCallbacks.push(cb); }),
  };

  const playerSpriteMock = { x: 200, y: 145 };
  const playerMock = { sprite: playerSpriteMock, heal: vi.fn() };

  const sceneMock = {
    registerFixedUpdate:   vi.fn(),
    unregisterFixedUpdate: vi.fn(),
    events: {
      emit: vi.fn(),
      on: vi.fn(),
      off: vi.fn(),
    },
    cameras: { main: cameraMain },
    scale: { width: 384, height: 224 },
    scene: {
      restart: vi.fn(),
      start:   vi.fn(),
    },
    add: {
      tileSprite: vi.fn(() => {
        const ts = {
          tilePositionX: 0,
          setOrigin: vi.fn(),
          setDepth: vi.fn(),
          setScrollFactor: vi.fn(),
          destroy: vi.fn(),
        };
        tileSpriteInstances.push(ts);
        return ts;
      }),
      image: vi.fn(() => ({
        x: 0, y: 0, alpha: 1, active: true,
        setDepth: vi.fn(), destroy: vi.fn(),
      })),
    },
    tweens: {
      add: vi.fn(() => ({})),
    },
    time: {
      addEvent: vi.fn((cfg: { delay: number; callback: () => void }) => {
        timerCallbacks.push(cfg);
        return { remove: vi.fn() };
      }),
    },
    getPlayer: vi.fn(() => playerMock),
  };

  return { sceneMock, cameraMain, playerMock, playerSpriteMock, fadeOutCallbacks, timerCallbacks, tileSpriteInstances };
});

vi.mock('phaser', () => ({
  default: {
    Scene: class {},
    AUTO: 0,
    Math: { Clamp: (v: number, lo: number, hi: number) => Math.min(Math.max(v, lo), hi) },
    Scale: { FIT: 'FIT', NONE: 'NONE', CENTER_BOTH: 'CENTER_BOTH' },
  },
  Scene: class {},
}));

import { GameConfig } from '../config/GameConfig';
import { StageManager } from '../stage/StageManager';
import { stage1Data } from '../data/stage1Data';
import type { StageData } from '../stage/StageData';

// Minimal single-zone stage for most tests
const SIMPLE_STAGE: StageData = {
  id: 1,
  stageWidth: 1000,
  groundTop: GameConfig.GROUND_TOP,
  groundBottom: GameConfig.GROUND_BOTTOM,
  layers: [
    { textureKey: 'layer-1', speedFactor: 0.1, depth: 0 },
    { textureKey: 'layer-2', speedFactor: 0.3, depth: 1 },
    { textureKey: 'layer-3', speedFactor: 0.6, depth: 2 },
  ],
  scrollTriggers: [{ worldX: 400, zoneId: 'z1' }],
  spawnZones: [{ id: 'z1', entries: [{ archetype: 'punk', count: 1, staggerDelayMs: 100 }] }],
  props: [],
};

describe('StageManager', () => {
  let manager: StageManager;
  let fixedCallbacks: Array<(dt: number) => void>;
  let zoneClearedHandler: (id: string) => void;

  const tick = (dt = GameConfig.FIXED_DELTA_MS) => {
    for (const fn of fixedCallbacks) fn(dt);
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.tileSpriteInstances.length = 0;
    mocks.fadeOutCallbacks.length = 0;
    mocks.timerCallbacks.length = 0;
    fixedCallbacks = [];
    mocks.cameraMain.scrollX = 0;

    mocks.sceneMock.registerFixedUpdate.mockImplementation((fn: (dt: number) => void) => {
      fixedCallbacks.push(fn);
    });

    mocks.sceneMock.events.on.mockImplementation((event: string, fn: (id: string) => void) => {
      if (event === 'zoneCleared') zoneClearedHandler = fn;
    });

    mocks.playerSpriteMock.x = 200;

    manager = new StageManager(
      mocks.sceneMock as unknown as Parameters<typeof StageManager>[0],
      SIMPLE_STAGE,
      1,
    );
  });

  it('starts with cameraX = 0', () => {
    expect(manager.cameraX).toBe(0);
  });

  it('camera advances rightward when player moves right', () => {
    mocks.playerSpriteMock.x = 350; // player at right half of screen
    tick();
    expect(manager.cameraX).toBeGreaterThan(0);
  });

  it('camera never moves left', () => {
    mocks.playerSpriteMock.x = 350;
    tick();
    const prev = manager.cameraX;
    mocks.playerSpriteMock.x = 10; // player moves far left
    tick();
    expect(manager.cameraX).toBeGreaterThanOrEqual(prev);
  });

  it('camera locks when scroll trigger world X is reached', () => {
    // Push camera past trigger at worldX=400
    for (let i = 0; i < 60 * 10; i++) {
      mocks.playerSpriteMock.x = GameConfig.CANVAS_WIDTH - 1;
      tick();
      if (manager.cameraX + GameConfig.CANVAS_WIDTH >= SIMPLE_STAGE.scrollTriggers[0].worldX) break;
    }
    expect(manager.isLocked).toBe(true);
  });

  it('camera unlocks after zoneCleared event', () => {
    // Lock it first
    mocks.cameraMain.scrollX = 200;
    manager['_cameraX'] = 200;
    manager['_locked'] = true;

    zoneClearedHandler('z1');
    expect(manager.isLocked).toBe(false);
  });

  it('unlocks gate on zoneCleared even when earlier zones still remain', () => {
    // Multi-zone stage: 3 zones. Lock the camera, fire zone cleared for the FIRST zone.
    // FR-SM-02: gate must unlock after ANY zone is cleared, not only after all zones.
    const multiZoneStage: StageData = {
      ...SIMPLE_STAGE,
      scrollTriggers: [
        { worldX: 400, zoneId: 'z1' },
        { worldX: 800, zoneId: 'z2' },
        { worldX: 1200, zoneId: 'z3' },
      ],
      spawnZones: [
        { id: 'z1', entries: [{ archetype: 'punk', count: 1, staggerDelayMs: 0 }] },
        { id: 'z2', entries: [{ archetype: 'punk', count: 1, staggerDelayMs: 0 }] },
        { id: 'z3', entries: [{ archetype: 'punk', count: 1, staggerDelayMs: 0 }] },
      ],
    };
    vi.clearAllMocks();
    let localZoneClearedHandler: (id: string) => void = () => {};
    mocks.sceneMock.events.on.mockImplementation((event: string, fn: (id: string) => void) => {
      if (event === 'zoneCleared') localZoneClearedHandler = fn;
    });
    const multiManager = new StageManager(
      mocks.sceneMock as unknown as Parameters<typeof StageManager>[0],
      multiZoneStage,
      1,
    );
    multiManager['_locked'] = true;
    localZoneClearedHandler('z1'); // only first zone cleared — 2 zones still pending
    expect(multiManager.isLocked).toBe(false);
  });

  it('updates cameras.main.scrollX each tick', () => {
    mocks.playerSpriteMock.x = 350;
    tick();
    expect(mocks.cameraMain.scrollX).toBe(manager.cameraX);
  });

  it('stage1Data has stageWidth >= 5000', () => {
    expect(stage1Data.stageWidth).toBeGreaterThanOrEqual(5000);
  });

  it('registers fixedUpdate callbacks on construction', () => {
    expect(mocks.sceneMock.registerFixedUpdate).toHaveBeenCalled();
  });

  it('unregisters callback on destroy()', () => {
    manager.destroy();
    expect(mocks.sceneMock.unregisterFixedUpdate).toHaveBeenCalled();
  });
});
