import { describe, it, expect, vi, beforeEach } from 'vitest';

const mocks = vi.hoisted(() => {
  const spriteMock = {
    x: 100, y: 150,
    setFlipX:    vi.fn(),
    setDepth: vi.fn(),
    setVelocityX: vi.fn(),
    setVelocityY: vi.fn(),
    setCollideWorldBounds: vi.fn(),
    destroy:      vi.fn(),
    play:         vi.fn(),
  };
  const sceneMock = {
    physics: { add: { sprite: vi.fn(() => spriteMock) } },
    add:     { rectangle: vi.fn(() => ({ x: 0, y: 0, destroy: vi.fn() })), graphics: vi.fn(() => ({ setDepth: vi.fn(), clear: vi.fn(), fillStyle: vi.fn(), fillRect: vi.fn(), destroy: vi.fn() })) },
    events:  { emit: vi.fn(), on: vi.fn(), off: vi.fn() },
    anims:   { exists: vi.fn(() => true), create: vi.fn(), generateFrameNumbers: vi.fn(() => []) },
  };
  return { sceneMock, spriteMock };
});

vi.mock('phaser', () => ({
  default: { Scene: class {}, Scale: { FIT: 'FIT', NONE: 'NONE', CENTER_BOTH: 'CENTER_BOTH' } },
  Scene:   class {},
}));

import type Phaser from 'phaser';
import { CombatSystem }             from '../combat/CombatSystem';
import { AttackerCoordinator }      from '../enemy/AttackerCoordinator';
import { KnifeThrowerController }   from '../enemy/KnifeThrowerController';
import { EnemyState }               from '../enemy/EnemyState';
import {
  KNIFE_THROWER_MAX_HP,
  KNIFE_THROWER_MIN_DISTANCE,
  KNIFE_THROWER_MAX_DISTANCE,
  KNIFE_THROW_COOLDOWN_FRAMES,
  KNIFE_THROWER_THROW_STARTUP_FRAMES,
} from '../enemy/EnemyConfig';

function makeThrower(x = 100) {
  const combat = new CombatSystem();
  const coord  = new AttackerCoordinator();
  const thrower = new KnifeThrowerController({
    scene:        mocks.sceneMock as unknown as Phaser.Scene,
    id:           'test-thrower',
    x,
    y:            150,
    facingRight:  true,
    combatSystem: combat,
    coordinator:  coord,
  });
  return { thrower, combat, coord };
}

describe('KnifeThrowerController', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('spawns with full HP and Idle state', () => {
    const { thrower } = makeThrower();
    expect(thrower.hp).toBe(KNIFE_THROWER_MAX_HP);
    expect(thrower.state).toBe(EnemyState.Idle);
  });

  it('retreats when player is closer than MIN_DISTANCE', () => {
    const { thrower } = makeThrower();
    // First tick enters Aggro
    const nearPlayerX = mocks.spriteMock.x + KNIFE_THROWER_MIN_DISTANCE - 20;
    thrower.fixedUpdate(nearPlayerX, 150);
    thrower.fixedUpdate(nearPlayerX, 150);
    // Thrower should have set negative velocity (retreat away from player)
    const calls = mocks.spriteMock.setVelocityX.mock.calls;
    const retreatCall = calls.find(([v]: [number]) => v < 0);
    expect(retreatCall).toBeDefined();
  });

  it('advances when player is farther than MAX_DISTANCE', () => {
    const { thrower } = makeThrower();
    const farPlayerX = mocks.spriteMock.x + KNIFE_THROWER_MAX_DISTANCE + 50;
    thrower.fixedUpdate(farPlayerX, 150);
    thrower.fixedUpdate(farPlayerX, 150);
    const calls = mocks.spriteMock.setVelocityX.mock.calls;
    const advanceCall = calls.find(([v]: [number]) => v > 0);
    expect(advanceCall).toBeDefined();
  });

  it('enters Attack state when in optimal range', () => {
    const { thrower } = makeThrower();
    // optimal range: between MIN_DISTANCE and MAX_DISTANCE
    const optimalX = mocks.spriteMock.x + KNIFE_THROWER_MIN_DISTANCE + 20;
    thrower.fixedUpdate(optimalX, 150);
    thrower.fixedUpdate(optimalX, 150);
    expect(thrower.state).toBe(EnemyState.Attack);
  });

  it('spawns a knife after THROW_STARTUP_FRAMES ticks in Attack state', () => {
    const { thrower } = makeThrower();
    const rectSpy = vi.spyOn(mocks.sceneMock.add, 'rectangle');
    const optimalX = mocks.spriteMock.x + KNIFE_THROWER_MIN_DISTANCE + 20;
    // Enter attack
    thrower.fixedUpdate(optimalX, 150);
    thrower.fixedUpdate(optimalX, 150);
    expect(thrower.state).toBe(EnemyState.Attack);
    const callsBefore = rectSpy.mock.calls.length;
    // Advance to throw frame
    for (let i = 0; i < KNIFE_THROWER_THROW_STARTUP_FRAMES; i++) {
      thrower.fixedUpdate(optimalX, 150);
    }
    // rectangle is called to create the knife sprite
    expect(rectSpy.mock.calls.length).toBeGreaterThan(callsBefore);
  });

  it('returns to Aggro after throw cooldown expires', () => {
    const { thrower } = makeThrower();
    const optimalX = mocks.spriteMock.x + KNIFE_THROWER_MIN_DISTANCE + 20;
    thrower.fixedUpdate(optimalX, 150); // Idle → Aggro
    thrower.fixedUpdate(optimalX, 150); // Aggro → Attack (attackTimer=0)
    // Run exactly KNIFE_THROW_COOLDOWN_FRAMES ticks to exhaust attack
    for (let i = 0; i < KNIFE_THROW_COOLDOWN_FRAMES; i++) {
      thrower.fixedUpdate(optimalX, 150);
    }
    expect(thrower.state).toBe(EnemyState.Aggro);
  });

  it('transitions to Death when HP reaches 0', () => {
    const { thrower, combat } = makeThrower();
    // Get into Aggro first so Hurt is reachable
    thrower.fixedUpdate(mocks.spriteMock.x + KNIFE_THROWER_MIN_DISTANCE + 20, 150);
    combat.dispatchHit('enemy_test-thrower', {
      damage:         KNIFE_THROWER_MAX_HP + 100,
      knockbackX:     0, knockbackY: 0,
      hitStunFrames:  10,
      attackerFacing: 'right',
      teamTag:        'player',
      isGrab: false, isAoe: false,
    });
    expect(thrower.state).toBe(EnemyState.Death);
  });
});
