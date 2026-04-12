import { describe, it, expect, vi, beforeEach } from 'vitest';

const mocks = vi.hoisted(() => {
  const tweenCallbacks: Array<{ onComplete?: () => void }> = [];
  const timeCallbacks: Array<{ delay: number; callback: () => void; callbackScope?: unknown }> = [];

  const spriteMock = {
    x: 200,
    y: 145,
    scaleX: 1,
    scaleY: 1,
    alpha: 1,
    active: true,
    setDepth: vi.fn(),
    setTint: vi.fn(),
    setVisible: vi.fn(),
    destroy: vi.fn(function (this: { active: boolean }) { this.active = false; }),
  };

  let imageCallCount = 0;

  const sceneMock = {
    registerFixedUpdate:   vi.fn(),
    unregisterFixedUpdate: vi.fn(),
    add: {
      image: vi.fn(() => { imageCallCount++; return spriteMock; }),
    },
    tweens: {
      add: vi.fn((cfg: { onComplete?: () => void }) => {
        tweenCallbacks.push(cfg);
        return {};
      }),
    },
    time: {
      addEvent: vi.fn((cfg: { delay: number; callback: () => void; callbackScope?: unknown }) => {
        timeCallbacks.push(cfg);
        return { remove: vi.fn() };
      }),
    },
  };

  return { spriteMock, sceneMock, tweenCallbacks, timeCallbacks, get imageCallCount() { return imageCallCount; }, resetImageCallCount() { imageCallCount = 0; } };
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
import { DestructibleProp } from '../stage/DestructibleProp';
import type { PropDef } from '../stage/StageData';

const BARREL_DEF: PropDef = {
  worldX: 400,
  worldY: 145,
  type: 'barrel',
  hp: GameConfig.PROP_BARREL_HP, // 3
  dropItemType: 'health',
  dropChance: 1.0, // always drop for deterministic tests
};

const BARREL_NO_DROP: PropDef = {
  worldX: 400,
  worldY: 145,
  type: 'barrel',
  hp: GameConfig.PROP_BARREL_HP,
  dropItemType: null,
  dropChance: 0,
};

const BARREL_ZERO_CHANCE: PropDef = {
  worldX: 400,
  worldY: 145,
  type: 'barrel',
  hp: GameConfig.PROP_BARREL_HP,
  dropItemType: 'health',
  dropChance: 0,
};

const CRATE_NO_DROP: PropDef = {
  worldX: 600,
  worldY: 145,
  type: 'crate',
  hp: GameConfig.PROP_CRATE_HP, // 2
  dropItemType: null,
  dropChance: 0,
};

/** Helper: apply `count` hits of damage 1 to `prop`. */
function hitTimes(prop: DestructibleProp, count: number) {
  for (let i = 0; i < count; i++) prop.hit(1);
}

describe('DestructibleProp', () => {
  let prop: DestructibleProp;
  let spawnCallback: ReturnType<typeof vi.fn>;
  let cameraX: number;

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.tweenCallbacks.length = 0;
    mocks.timeCallbacks.length = 0;
    mocks.resetImageCallCount();
    mocks.spriteMock.active = true;
    mocks.spriteMock.alpha = 1;
    cameraX = 0;
    spawnCallback = vi.fn();
    prop = new DestructibleProp(
      mocks.sceneMock as unknown as Parameters<typeof DestructibleProp>[0],
      BARREL_DEF,
      () => cameraX,
      spawnCallback,
    );
  });

  it('starts with full HP', () => {
    expect(prop.hp).toBe(BARREL_DEF.hp);
  });

  it('creates exactly one sprite object at construction', () => {
    // Only a single scene.add.image call per prop
    expect(mocks.sceneMock.add.image).toHaveBeenCalledTimes(1);
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

  it('no intermediate visual change on hit 1', () => {
    prop.hit(1);
    // No tint applied mid-combat — sprite looks intact
    expect(mocks.spriteMock.setTint).not.toHaveBeenCalled();
  });

  it('isDead after receiving def.hp hits', () => {
    hitTimes(prop, BARREL_DEF.hp);
    expect(prop.isDead).toBe(true);
  });

  it('applies crushed tint to sprite on final hit', () => {
    hitTimes(prop, BARREL_DEF.hp);
    expect(mocks.spriteMock.setTint).toHaveBeenCalledWith(GameConfig.BARREL_CRUSHED_TINT);
  });

  it('schedules time.addEvent on destruction (crushed linger delay)', () => {
    hitTimes(prop, BARREL_DEF.hp);
    expect(mocks.sceneMock.time.addEvent).toHaveBeenCalled();
  });

  it('hit() is no-op when already dead', () => {
    hitTimes(prop, BARREL_DEF.hp); // kills it
    const tweensBefore = mocks.sceneMock.tweens.add.mock.calls.length;
    prop.hit(1);
    expect(mocks.sceneMock.tweens.add.mock.calls.length).toBe(tweensBefore);
  });

  it('spawns exactly one item at barrel position when dropChance is 1.0', () => {
    hitTimes(prop, BARREL_DEF.hp);
    const timerEvent = mocks.timeCallbacks[0];
    timerEvent.callback.call(timerEvent.callbackScope ?? prop);
    expect(spawnCallback).toHaveBeenCalledTimes(1);
    expect(spawnCallback).toHaveBeenCalledWith('health', BARREL_DEF.worldX, BARREL_DEF.worldY);
  });

  it('does NOT spawn item when dropItemType is null', () => {
    mocks.resetImageCallCount();
    const propNoDrop = new DestructibleProp(
      mocks.sceneMock as unknown as Parameters<typeof DestructibleProp>[0],
      CRATE_NO_DROP,
      () => cameraX,
      spawnCallback,
    );
    hitTimes(propNoDrop, CRATE_NO_DROP.hp);
    const timerEvent = mocks.timeCallbacks[0];
    timerEvent.callback.call(timerEvent.callbackScope ?? propNoDrop);
    expect(spawnCallback).not.toHaveBeenCalled();
  });

  it('does NOT spawn item when dropChance is 0', () => {
    mocks.resetImageCallCount();
    const propZeroChance = new DestructibleProp(
      mocks.sceneMock as unknown as Parameters<typeof DestructibleProp>[0],
      BARREL_ZERO_CHANCE,
      () => cameraX,
      spawnCallback,
    );
    hitTimes(propZeroChance, BARREL_ZERO_CHANCE.hp);
    const timerEvent = mocks.timeCallbacks[0];
    timerEvent.callback.call(timerEvent.callbackScope ?? propZeroChance);
    expect(spawnCallback).not.toHaveBeenCalled();
  });

  it('does NOT spawn item when random roll >= dropChance', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.8);
    mocks.resetImageCallCount();
    const propPartialChance = new DestructibleProp(
      mocks.sceneMock as unknown as Parameters<typeof DestructibleProp>[0],
      { ...BARREL_DEF, dropChance: 0.5 },
      () => cameraX,
      spawnCallback,
    );
    hitTimes(propPartialChance, BARREL_DEF.hp);
    const timerEvent = mocks.timeCallbacks[0];
    timerEvent.callback.call(timerEvent.callbackScope ?? propPartialChance);
    expect(spawnCallback).not.toHaveBeenCalled();
    vi.restoreAllMocks();
  });

  it('DOES spawn item when random roll < dropChance', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.3);
    mocks.resetImageCallCount();
    const propPartialChance = new DestructibleProp(
      mocks.sceneMock as unknown as Parameters<typeof DestructibleProp>[0],
      { ...BARREL_DEF, dropChance: 0.5 },
      () => cameraX,
      spawnCallback,
    );
    hitTimes(propPartialChance, BARREL_DEF.hp);
    const timerEvent = mocks.timeCallbacks[0];
    timerEvent.callback.call(timerEvent.callbackScope ?? propPartialChance);
    expect(spawnCallback).toHaveBeenCalledTimes(1);
    vi.restoreAllMocks();
  });

  it('starts a tween after the linger delay fires', () => {
    hitTimes(prop, BARREL_DEF.hp);
    const timerEvent = mocks.timeCallbacks[0];
    timerEvent.callback.call(timerEvent.callbackScope ?? prop);
    expect(mocks.sceneMock.tweens.add).toHaveBeenCalled();
  });

  it('unregisters fixedUpdate on destruction', () => {
    hitTimes(prop, BARREL_DEF.hp);
    expect(mocks.sceneMock.unregisterFixedUpdate).toHaveBeenCalledOnce();
  });

  it('does NOT spawn item when dropItemType is null regardless of dropChance', () => {
    mocks.resetImageCallCount();
    const propNullType = new DestructibleProp(
      mocks.sceneMock as unknown as Parameters<typeof DestructibleProp>[0],
      BARREL_NO_DROP,
      () => cameraX,
      spawnCallback,
    );
    hitTimes(propNullType, BARREL_NO_DROP.hp);
    const timerEvent = mocks.timeCallbacks[0];
    timerEvent.callback.call(timerEvent.callbackScope ?? propNullType);
    expect(spawnCallback).not.toHaveBeenCalled();
  });
});
