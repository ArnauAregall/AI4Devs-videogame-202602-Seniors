import { describe, it, expect, vi, beforeEach } from 'vitest';

const mocks = vi.hoisted(() => {
  const tweenCallbacks: Array<{ onComplete?: () => void }> = [];

  const spriteMock = {
    x: 200,
    y: 145,
    scaleX: 1,
    scaleY: 1,
    alpha: 1,
    active: true,
    setDepth: vi.fn(),
    destroy: vi.fn(() => { spriteMock.active = false; }),
  };

  const sceneMock = {
    registerFixedUpdate:   vi.fn(),
    unregisterFixedUpdate: vi.fn(),
    add: {
      image: vi.fn(() => spriteMock),
    },
    tweens: {
      add: vi.fn((cfg: { onComplete?: () => void }) => {
        tweenCallbacks.push(cfg);
        return {};
      }),
    },
  };

  return { spriteMock, sceneMock, tweenCallbacks };
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
  hp: GameConfig.PROP_BARREL_HP,
  dropItemType: 'health',
};

const CRATE_NO_DROP: PropDef = {
  worldX: 600,
  worldY: 145,
  type: 'crate',
  hp: GameConfig.PROP_CRATE_HP,
  dropItemType: null,
};

describe('DestructibleProp', () => {
  let prop: DestructibleProp;
  let spawnCallback: ReturnType<typeof vi.fn>;
  let cameraX: number;

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.tweenCallbacks.length = 0;
    mocks.spriteMock.active = true;
    mocks.spriteMock.alpha = 1;
    cameraX = 0;
    spawnCallback = vi.fn();
    mocks.sceneMock.add.image.mockReturnValue(mocks.spriteMock);
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

  it('hit() reduces HP', () => {
    prop.hit(1);
    expect(prop.hp).toBe(BARREL_DEF.hp - 1);
  });

  it('is not dead after partial damage', () => {
    prop.hit(1);
    expect(prop.isDead).toBe(false);
  });

  it('isDead is true when HP reaches 0', () => {
    prop.hit(BARREL_DEF.hp);
    expect(prop.isDead).toBe(true);
  });

  it('hit() is no-op when already dead', () => {
    prop.hit(BARREL_DEF.hp); // kills it
    const tweensBefore = mocks.sceneMock.tweens.add.mock.calls.length;
    prop.hit(1);
    expect(mocks.sceneMock.tweens.add.mock.calls.length).toBe(tweensBefore);
  });

  it('spawns item with correct type on destruction when dropItemType is set', () => {
    prop.hit(BARREL_DEF.hp);
    expect(spawnCallback).toHaveBeenCalledWith('health', BARREL_DEF.worldX, BARREL_DEF.worldY);
  });

  it('does NOT spawn item when dropItemType is null', () => {
    const propNoDrop = new DestructibleProp(
      mocks.sceneMock as unknown as Parameters<typeof DestructibleProp>[0],
      CRATE_NO_DROP,
      () => cameraX,
      spawnCallback,
    );
    propNoDrop.hit(CRATE_NO_DROP.hp);
    expect(spawnCallback).not.toHaveBeenCalled();
  });

  it('starts a tween on destruction', () => {
    prop.hit(BARREL_DEF.hp);
    expect(mocks.sceneMock.tweens.add).toHaveBeenCalled();
  });

  it('unregisters fixedUpdate on destruction', () => {
    prop.hit(BARREL_DEF.hp);
    expect(mocks.sceneMock.unregisterFixedUpdate).toHaveBeenCalledOnce();
  });
});
