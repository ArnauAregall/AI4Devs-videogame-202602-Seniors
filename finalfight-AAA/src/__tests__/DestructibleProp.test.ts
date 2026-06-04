import { describe, it, expect, vi, beforeEach } from 'vitest';

const mocks = vi.hoisted(() => {
  const timeCallbacks: Array<{ delay: number; callback: () => void; callbackScope?: unknown }> = [];
  const animListeners: Record<string, Array<{ cb: (...args: unknown[]) => void; ctx: unknown }>> = {};

  const spriteMock = {
    x: 200,
    y: 145,
    displayWidth: 32,
    displayHeight: 48,
    active: true,
    setDepth: vi.fn(),
    setTint: vi.fn(),
    setFrame: vi.fn(),
    setVisible: vi.fn(),
    play: vi.fn(),
    on: vi.fn((event: string, cb: (...args: unknown[]) => void, ctx?: unknown) => {
      if (!animListeners[event]) animListeners[event] = [];
      animListeners[event].push({ cb, ctx });
    }),
    destroy: vi.fn(function (this: { active: boolean }) { this.active = false; }),
  };

  const particleEmitterMock = {
    explode: vi.fn(),
  };

  const sceneMock = {
    registerFixedUpdate: vi.fn(),
    unregisterFixedUpdate: vi.fn(),
    add: {
      sprite: vi.fn(() => spriteMock),
      particles: vi.fn(() => particleEmitterMock),
    },
    time: {
      addEvent: vi.fn((cfg: { delay: number; callback: () => void; callbackScope?: unknown }) => {
        timeCallbacks.push(cfg);
        return { remove: vi.fn() };
      }),
    },
  };

  return {
    spriteMock,
    sceneMock,
    particleEmitterMock,
    timeCallbacks,
    animListeners,
    fireAnimComplete() {
      (animListeners['animationcomplete'] || []).forEach(({ cb, ctx }) => cb.call(ctx));
    },
    reset() {
      timeCallbacks.length = 0;
      for (const k of Object.keys(animListeners)) delete animListeners[k];
    },
  };
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
import { DestructibleProp, SpawnItemCallback } from '../stage/DestructibleProp';
import type { PropDef } from '../stage/StageData';

type SceneArg = ConstructorParameters<typeof DestructibleProp>[0];

const BARREL_DEF: PropDef = {
  worldX: 400,
  worldY: 145,
  type: 'barrel',
  hp: GameConfig.PROP_BARREL_HP,
  dropItemType: 'health',
  dropChance: 1.0,
};

const CRATE_NO_DROP: PropDef = {
  worldX: 600,
  worldY: 145,
  type: 'crate',
  hp: GameConfig.PROP_CRATE_HP,
  dropItemType: null,
  dropChance: 0,
};

const DUMPSTER_DEF: PropDef = {
  worldX: 500,
  worldY: 145,
  type: 'dumpster',
  hp: GameConfig.PROP_DUMPSTER_HP,
  dropItemType: null,
  dropChance: 0,
};

function hitTimes(prop: DestructibleProp, count: number) {
  for (let i = 0; i < count; i++) prop.hit(1);
}

describe('DestructibleProp', () => {
  let prop: DestructibleProp;
  let spawnCallback: SpawnItemCallback;
  let cameraX: number;

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.reset();
    mocks.spriteMock.active = true;
    mocks.spriteMock.x = 200;
    cameraX = 0;
    spawnCallback = vi.fn() as unknown as SpawnItemCallback;
    prop = new DestructibleProp(
      mocks.sceneMock as unknown as SceneArg,
      BARREL_DEF,
      () => cameraX,
      spawnCallback,
    );
  });

  it('starts with full HP', () => {
    expect(prop.hp).toBe(BARREL_DEF.hp);
  });

  it('creates exactly one sprite object at construction', () => {
    expect(mocks.sceneMock.add.sprite).toHaveBeenCalledTimes(1);
  });

  it('hit() reduces HP and increments hitCount', () => {
    prop.hit(1);
    expect(prop.hp).toBe(BARREL_DEF.hp - 1);
    expect(prop.hitCount).toBe(1);
  });

  it('is not dead after partial hits', () => {
    hitTimes(prop, BARREL_DEF.hp - 1);
    expect(prop.isDead).toBe(false);
  });

  it('isDead after receiving def.hp hits', () => {
    hitTimes(prop, BARREL_DEF.hp);
    expect(prop.isDead).toBe(true);
  });

  it('sets frame 0 (intact) on creation', () => {
    expect(mocks.spriteMock.setFrame).toHaveBeenCalledWith(0);
  });

  it('applies crushed frame (1) on final hit', () => {
    hitTimes(prop, BARREL_DEF.hp);
    expect(mocks.spriteMock.setFrame).toHaveBeenCalledWith(1);
  });

  it('hit() is no-op when already dead', () => {
    hitTimes(prop, BARREL_DEF.hp);
    const callsBefore = mocks.sceneMock.time.addEvent.mock.calls.length;
    prop.hit(1);
    expect(mocks.sceneMock.time.addEvent.mock.calls.length).toBe(callsBefore);
  });

  // --- Task 5.1: destruction animation playback ---

  it('plays destruction animation after linger delay fires', () => {
    hitTimes(prop, BARREL_DEF.hp);
    const timerEvent = mocks.timeCallbacks[0];
    timerEvent.callback.call(timerEvent.callbackScope ?? prop);
    expect(mocks.spriteMock.play).toHaveBeenCalledWith('prop-barrel-destroy');
  });

  it('registers animationcomplete listener after linger delay', () => {
    hitTimes(prop, BARREL_DEF.hp);
    const timerEvent = mocks.timeCallbacks[0];
    timerEvent.callback.call(timerEvent.callbackScope ?? prop);
    expect(mocks.spriteMock.on).toHaveBeenCalledWith('animationcomplete', expect.any(Function), expect.anything());
  });

  it('destroys sprite on animationcomplete', () => {
    hitTimes(prop, BARREL_DEF.hp);
    const timerEvent = mocks.timeCallbacks[0];
    timerEvent.callback.call(timerEvent.callbackScope ?? prop);
    mocks.fireAnimComplete();
    expect(mocks.spriteMock.destroy).toHaveBeenCalled();
  });

  it('spawns item on animationcomplete when dropChance is 1.0', () => {
    hitTimes(prop, BARREL_DEF.hp);
    const timerEvent = mocks.timeCallbacks[0];
    timerEvent.callback.call(timerEvent.callbackScope ?? prop);
    mocks.fireAnimComplete();
    expect(spawnCallback).toHaveBeenCalledWith('health', BARREL_DEF.worldX, BARREL_DEF.worldY);
  });

  it('does NOT spawn item when dropItemType is null', () => {
    mocks.reset();
    const propNoDrop = new DestructibleProp(
      mocks.sceneMock as unknown as SceneArg,
      CRATE_NO_DROP,
      () => cameraX,
      spawnCallback,
    );
    hitTimes(propNoDrop, CRATE_NO_DROP.hp);
    const timerEvent = mocks.timeCallbacks[0];
    timerEvent.callback.call(timerEvent.callbackScope ?? propNoDrop);
    mocks.fireAnimComplete();
    expect(spawnCallback).not.toHaveBeenCalled();
  });

  // --- Task 5.2: hurtboxRect zero-size after destruction ---

  it('hurtboxRect returns zero-size rect after destruction starts', () => {
    hitTimes(prop, BARREL_DEF.hp);
    expect(prop.hurtboxRect).toEqual({ x: 0, y: 0, w: 0, h: 0 });
  });

  it('hurtboxRect returns valid rect before destruction', () => {
    const rect = prop.hurtboxRect;
    expect(rect.w).toBeGreaterThan(0);
    expect(rect.h).toBeGreaterThan(0);
  });

  // --- Task 5.3: particle emitter explode with correct count on high quality ---

  it('particle emitter explode called with full count on high quality', () => {
    hitTimes(prop, BARREL_DEF.hp);
    const timerEvent = mocks.timeCallbacks[0];
    timerEvent.callback.call(timerEvent.callbackScope ?? prop);
    mocks.fireAnimComplete();
    expect(mocks.sceneMock.add.particles).toHaveBeenCalled();
    expect(mocks.particleEmitterMock.explode).toHaveBeenCalledWith(GameConfig.DEBRIS_PARTICLE_COUNT);
  });

  // --- Task 5.4: particle count halved when quality is low ---

  it('particle count halved when quality is low', () => {
    // Temporarily override PARTICLE_QUALITY
    const original = GameConfig.PARTICLE_QUALITY;
    Object.defineProperty(GameConfig, 'PARTICLE_QUALITY', { value: 'low', writable: true, configurable: true });

    mocks.reset();
    const lowProp = new DestructibleProp(
      mocks.sceneMock as unknown as SceneArg,
      BARREL_DEF,
      () => cameraX,
      spawnCallback,
    );
    hitTimes(lowProp, BARREL_DEF.hp);
    const timerEvent = mocks.timeCallbacks[0];
    timerEvent.callback.call(timerEvent.callbackScope ?? lowProp);
    mocks.fireAnimComplete();

    const expectedCount = Math.floor(GameConfig.DEBRIS_PARTICLE_COUNT * 0.5);
    expect(mocks.particleEmitterMock.explode).toHaveBeenCalledWith(expectedCount);

    // Restore
    Object.defineProperty(GameConfig, 'PARTICLE_QUALITY', { value: original, writable: true, configurable: true });
  });

  // --- Task 5.5: dumpster subtype instantiation ---

  it('dumpster subtype instantiates with correct HP', () => {
    mocks.reset();
    const dumpster = new DestructibleProp(
      mocks.sceneMock as unknown as SceneArg,
      DUMPSTER_DEF,
      () => cameraX,
      spawnCallback,
    );
    expect(dumpster.hp).toBe(GameConfig.PROP_DUMPSTER_HP);
  });

  it('dumpster subtype creates a sprite (uses barrel placeholder)', () => {
    mocks.reset();
    vi.clearAllMocks();
    new DestructibleProp(
      mocks.sceneMock as unknown as SceneArg,
      DUMPSTER_DEF,
      () => cameraX,
      spawnCallback,
    );
    expect(mocks.sceneMock.add.sprite).toHaveBeenCalledTimes(1);
  });

  it('unregisters fixedUpdate on destruction', () => {
    hitTimes(prop, BARREL_DEF.hp);
    expect(mocks.sceneMock.unregisterFixedUpdate).toHaveBeenCalledOnce();
  });
});
