import { describe, it, expect, vi, beforeEach } from 'vitest';

const mocks = vi.hoisted(() => {
  const tweenCallbacks: Array<{ onComplete?: () => void }> = [];

  const spriteMock = {
    x: 0,
    y: 0,
    alpha: 1,
    active: true,
    setDepth: vi.fn(),
    destroy: vi.fn(() => { spriteMock.active = false; }),
  };

  const playerSpriteMock = {
    x: 300,
    y: 145,
  };

  const playerMock = {
    sprite: playerSpriteMock,
    heal: vi.fn(),
    iFramesRemaining: 0,
    state: 'Idle',
  };

  const sceneMock = {
    registerFixedUpdate:   vi.fn(),
    unregisterFixedUpdate: vi.fn(),
    events: { emit: vi.fn() },
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

  return { spriteMock, playerMock, playerSpriteMock, sceneMock, tweenCallbacks };
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
import { ItemPickup } from '../stage/ItemPickup';
import type { PlayerController } from '../player/PlayerController';

describe('ItemPickup', () => {
  let pickup: ItemPickup;
  let registeredCallback: (dt: number) => void;
  let cameraX: number;

  const setupPickup = (type: 'health' | 'score', playerNear = false) => {
    mocks.spriteMock.active = true;
    mocks.spriteMock.alpha = 1;
    mocks.spriteMock.x = 200;
    mocks.spriteMock.y = 145;
    mocks.tweenCallbacks.length = 0;
    cameraX = 0;
    mocks.sceneMock.registerFixedUpdate.mockImplementation((fn: (dt: number) => void) => {
      registeredCallback = fn;
    });
    // playerNear = true: player at same X/Y as item (within 24 px overlap)
    // playerNear = false: player far away (no collection)
    mocks.playerSpriteMock.x = playerNear ? 200 : 999;
    mocks.playerSpriteMock.y = playerNear ? 145 : 999;

    pickup = new ItemPickup(
      mocks.sceneMock as unknown as Parameters<typeof ItemPickup>[0],
      type,
      200,
      145,
      () => cameraX,
      () => mocks.playerMock as unknown as PlayerController,
      () => new Map(),
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('is not collected at construction', () => {
    setupPickup('health');
    expect(pickup.isCollected).toBe(false);
  });

  it('calls player.heal() when health pickup is collected', () => {
    setupPickup('health', true); // player near item
    registeredCallback(16); // overlap detected on first tick
    expect(mocks.playerMock.heal).toHaveBeenCalledWith(GameConfig.ITEM_HEALTH_RESTORE_AMOUNT);
    expect(pickup.isCollected).toBe(true);
  });

  it('emits scorePickup event when score pickup is collected', () => {
    setupPickup('score', true); // player near item
    registeredCallback(16);
    expect(mocks.sceneMock.events.emit).toHaveBeenCalledWith('scorePickup', expect.any(Object));
    expect(pickup.isCollected).toBe(true);
  });

  it('does not re-collect after first collection', () => {
    setupPickup('health', true); // player near
    registeredCallback(16);
    const healCalls = mocks.playerMock.heal.mock.calls.length;
    registeredCallback(16);
    expect(mocks.playerMock.heal.mock.calls.length).toBe(healCalls);
  });

  it('despawns after ITEM_DESPAWN_TICKS ticks without collection', () => {
    setupPickup('health'); // player far — no collection
    for (let i = 0; i < GameConfig.ITEM_DESPAWN_TICKS; i++) {
      registeredCallback(16);
    }
    expect(mocks.sceneMock.tweens.add).toHaveBeenCalled();
    expect(mocks.sceneMock.unregisterFixedUpdate).toHaveBeenCalledOnce();
  });

  it('collected pickup does not trigger despawn tween', () => {
    setupPickup('health', true); // player near — collects on first tick
    registeredCallback(16); // collect now
    expect(pickup.isCollected).toBe(true);

    const tweenCallsAfterCollect = mocks.sceneMock.tweens.add.mock.calls.length;
    // run many more ticks — fixedUpdate is unregistered; despawn tween should not fire again
    for (let i = 0; i < GameConfig.ITEM_DESPAWN_TICKS; i++) {
      registeredCallback(16);
    }
    expect(mocks.sceneMock.tweens.add.mock.calls.length).toBe(tweenCallsAfterCollect);
  });
});
