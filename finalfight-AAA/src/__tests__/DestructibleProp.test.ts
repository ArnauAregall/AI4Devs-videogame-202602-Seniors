import { describe, it, expect, vi, beforeEach } from 'vitest';

const mocks = vi.hoisted(() => {
  const tweenCallbacks: Array<{ onComplete?: () => void }> = [];
  const timeCallbacks: Array<{ delay: number; callback: () => void; callbackScope?: unknown }> = [];

  const makeSpriteMock = () => ({
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
  });

  const healthySpriteMock = makeSpriteMock();
  const crushedSpriteMock = makeSpriteMock();
  let imageCallCount = 0;

  const sceneMock = {
    registerFixedUpdate:   vi.fn(),
    unregisterFixedUpdate: vi.fn(),
    add: {
      image: vi.fn(() => imageCallCount++ % 2 === 0 ? healthySpriteMock : crushedSpriteMock),
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

  return { healthySpriteMock, crushedSpriteMock, sceneMock, tweenCallbacks, timeCallbacks, get imageCallCount() { return imageCallCount; }, resetImageCallCount() { imageCallCount = 0; } };
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
};

const CRATE_NO_DROP: PropDef = {
  worldX: 600,
  worldY: 145,
  type: 'crate',
  hp: GameConfig.PROP_CRATE_HP, // 2
  dropItemType: null,
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
    mocks.healthySpriteMock.active = true;
    mocks.healthySpriteMock.alpha = 1;
    mocks.crushedSpriteMock.active = true;
    mocks.crushedSpriteMock.alpha = 1;
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

  it('healthy sprite is visible on creation', () => {
    // setVisible(false) is called only on the crushed sprite at construction
    expect(mocks.crushedSpriteMock.setVisible).toHaveBeenCalledWith(false);
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

  it('swaps to crushed sprite on the final hit', () => {
    hitTimes(prop, BARREL_DEF.hp);
    expect(mocks.healthySpriteMock.setVisible).toHaveBeenCalledWith(false);
    expect(mocks.crushedSpriteMock.setVisible).toHaveBeenCalledWith(true);
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

  it('spawns item with correct type when time callback fires', () => {
    hitTimes(prop, BARREL_DEF.hp);
    // Invoke the delayed callback (simulates the timer firing)
    const timerEvent = mocks.timeCallbacks[0];
    timerEvent.callback.call(timerEvent.callbackScope ?? prop);
    // Multi-drop: 1–3 items are spawned; check type and Y; X has scatter offset
    expect(spawnCallback).toHaveBeenCalledWith('health', expect.any(Number), BARREL_DEF.worldY);
    expect(spawnCallback.mock.calls.length).toBeGreaterThanOrEqual(1);
    expect(spawnCallback.mock.calls.length).toBeLessThanOrEqual(3);
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
});
