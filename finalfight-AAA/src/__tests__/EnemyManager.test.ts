import { describe, it, expect, vi, beforeEach } from 'vitest';

const mocks = vi.hoisted(() => {
  const spriteMock = {
    x: 200, y: 150,
    setFlipX: vi.fn(),
    setVelocityX: vi.fn(),
    setVelocityY: vi.fn(),
    destroy: vi.fn(),
  };
  type CB = (...args: unknown[]) => void;
  const eventListeners: Map<string, Array<{ cb: CB; ctx: unknown }>> = new Map();
  const sceneMock = {
    physics: { add: { sprite: vi.fn(() => spriteMock) } },
    events: {
      emit: vi.fn((name: string, ...args: unknown[]) => {
        eventListeners.get(name)?.forEach(({ cb, ctx }) => cb.call(ctx ?? cb, ...args));
      }),
      on: vi.fn((name: string, cb: CB, ctx?: unknown) => {
        if (!eventListeners.has(name)) eventListeners.set(name, []);
        eventListeners.get(name)!.push({ cb, ctx });
      }),
      off: vi.fn((name: string, cb: CB) => {
        const list = eventListeners.get(name);
        if (list) {
          const idx = list.findIndex(e => e.cb === cb);
          if (idx !== -1) list.splice(idx, 1);
        }
      }),
    },
  };
  return { sceneMock, spriteMock, eventListeners };
});

vi.mock('phaser', () => ({
  default: { Scene: class {} },
  Scene:   class {},
}));

import type Phaser from 'phaser';
import { CombatSystem }  from '../combat/CombatSystem';
import { EnemyManager, type EnemySpawnPayload } from '../enemy/EnemyManager';
import { DEATH_LINGER_FRAMES } from '../enemy/EnemyConfig';

function makeManager() {
  const combat = new CombatSystem();
  let playerPos = { x: 600, y: 150 };
  const getPlayer = () => ({ ...playerPos });
  const manager = new EnemyManager(
    mocks.sceneMock as unknown as Phaser.Scene,
    combat,
    getPlayer,
  );
  return { combat, manager, getPlayer, setPlayer: (x: number, y: number) => { playerPos = { x, y }; } };
}

function spawnPayload(overrides?: Partial<EnemySpawnPayload>): EnemySpawnPayload {
  return {
    id:          'e1',
    type:        'brawler',
    x:           200,
    y:           150,
    facingRight: true,
    ...overrides,
  };
}

describe('EnemyManager', () => {
  beforeEach(() => { vi.clearAllMocks(); mocks.eventListeners.clear(); });

  // ── Happy-path tests ──────────────────────────────────────────────────────

  it('spawns a brawler on enemySpawn event and tracks it internally', () => {
    const { manager } = makeManager();
    mocks.sceneMock.events.emit('enemySpawn', spawnPayload({ type: 'brawler' }));
    expect(manager.getEnemies().size).toBe(1);
  });

  it('spawns a rusher on enemySpawn event', () => {
    const { manager } = makeManager();
    mocks.sceneMock.events.emit('enemySpawn', spawnPayload({ type: 'rusher' }));
    expect(manager.getEnemies().size).toBe(1);
  });

  it('spawns a knife-thrower on enemySpawn event', () => {
    const { manager } = makeManager();
    mocks.sceneMock.events.emit('enemySpawn', spawnPayload({ type: 'knife-thrower' }));
    expect(manager.getEnemies().size).toBe(1);
  });

  it('spawns a boss on enemySpawn event', () => {
    const { manager } = makeManager();
    mocks.sceneMock.events.emit('enemySpawn', spawnPayload({ type: 'boss' }));
    expect(manager.getEnemies().size).toBe(1);
  });

  it('multiple spawns accumulate in the enemy map', () => {
    const { manager } = makeManager();
    mocks.sceneMock.events.emit('enemySpawn', spawnPayload({ id: 'a', type: 'brawler' }));
    mocks.sceneMock.events.emit('enemySpawn', spawnPayload({ id: 'b', type: 'rusher' }));
    expect(manager.getEnemies().size).toBe(2);
  });

  it('emits enemyDefeated and removes enemy after death linger', () => {
    const { manager, combat, setPlayer } = makeManager();
    mocks.sceneMock.events.emit('enemySpawn', spawnPayload({ id: 'e1', x: 200 }));

    // Bring player close enough to trigger Aggro (sprite.x=200, BRAWLER_AGGRO_RADIUS=160)
    setPlayer(210, 150);
    manager.fixedUpdate();

    // Now deal lethal damage from Aggro (Death is valid from Aggro)
    combat.dispatchHit('enemy_e1', {
      damage: 9999,
      knockbackX: 30, knockbackY: 0, hitStunFrames: 10,
      attackerFacing: 'right', teamTag: 'player', isGrab: false, isAoe: false,
    });

    // Tick past DEATH_LINGER_FRAMES to trigger isDead
    for (let i = 0; i <= DEATH_LINGER_FRAMES + 2; i++) {
      manager.fixedUpdate();
    }

    expect(manager.getEnemies().size).toBe(0);
    expect(mocks.sceneMock.events.emit).toHaveBeenCalledWith('enemyDefeated', expect.anything());
  });

  // ── Failure-state tests ───────────────────────────────────────────────────

  it('ignores duplicate spawn IDs', () => {
    const { manager } = makeManager();
    mocks.sceneMock.events.emit('enemySpawn', spawnPayload({ id: 'e1' }));
    mocks.sceneMock.events.emit('enemySpawn', spawnPayload({ id: 'e1' }));
    expect(manager.getEnemies().size).toBe(1);
  });

  it('does not tick enemies when grab-frozen', () => {
    const { manager, setPlayer } = makeManager();
    mocks.sceneMock.events.emit('enemySpawn', spawnPayload({ id: 'e1' }));
    mocks.sceneMock.events.emit('playerGrabStart');

    // Move player into aggro range
    setPlayer(200, 150);
    manager.fixedUpdate();
    manager.fixedUpdate();
    // After freeze, enemy should still be alive with no changes in enemy count
    expect(manager.getEnemies().size).toBe(1);
  });

  it('resumes ticking after playerGrabEnd', () => {
    const { manager } = makeManager();
    mocks.sceneMock.events.emit('enemySpawn', spawnPayload({ id: 'e1' }));
    mocks.sceneMock.events.emit('playerGrabStart');
    mocks.sceneMock.events.emit('playerGrabEnd');
    // Should not throw, manager runs normally
    expect(() => manager.fixedUpdate()).not.toThrow();
  });

  // ── Edge-case tests ───────────────────────────────────────────────────────

  it('enemyCount is 0 when no spawns have occurred', () => {
    const { manager } = makeManager();
    expect(manager.getEnemies().size).toBe(0);
  });

  it('fixedUpdate with no enemies does not throw', () => {
    const { manager } = makeManager();
    expect(() => manager.fixedUpdate()).not.toThrow();
  });

  it('enemy hurtbox is registered with CombatSystem on spawn', () => {
    const { combat } = makeManager();
    mocks.sceneMock.events.emit('enemySpawn', spawnPayload({ id: 'e1' }));
    expect(combat.getHurtbox('enemy_e1')).toBeDefined();
  });
});
