import { describe, it, expect, vi, beforeEach } from 'vitest';

// Phaser mock — must be hoisted before any Phaser-dependent import
const mocks = vi.hoisted(() => {
  const spriteMock = {
    x: 100, y: 150,
    setFlipX: vi.fn(),
    setDepth: vi.fn(),
    setVelocityX: vi.fn(),
    setVelocityY: vi.fn(),
    destroy: vi.fn(),
  };
  const physicsMock = {
    add: { sprite: vi.fn(() => spriteMock) },
  };
  const sceneMock = {
    physics: physicsMock,
    add: { rectangle: vi.fn(() => ({ x: 0, y: 0, destroy: vi.fn() })) },
    events: { emit: vi.fn(), on: vi.fn(), off: vi.fn() },
  };
  return { sceneMock, spriteMock };
});

vi.mock('phaser', () => ({
  default: { Scene: class {}, Scale: { FIT: 'FIT', NONE: 'NONE', CENTER_BOTH: 'CENTER_BOTH' } },
  Scene:   class {},
}));

import type Phaser from 'phaser';
import { CombatSystem }       from '../combat/CombatSystem';
import { AttackerCoordinator } from '../enemy/AttackerCoordinator';
import { BrawlerController }  from '../enemy/BrawlerController';
import { EnemyState }         from '../enemy/EnemyState';
import { BRAWLER_MAX_HP, BRAWLER_AGGRO_RADIUS } from '../enemy/EnemyConfig';

function makeBrawler(overrides?: Partial<{ x: number; playerX: number }>) {
  const combat = new CombatSystem();
  const coord  = new AttackerCoordinator();
  const brawler = new BrawlerController({
    scene:        mocks.sceneMock as unknown as Phaser.Scene,
    id:           'test-brawler',
    x:            overrides?.x ?? 100,
    y:            150,
    facingRight:  true,
    combatSystem: combat,
    coordinator:  coord,
  });
  return { brawler, combat, coord };
}

describe('BrawlerController (via EnemyController base)', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  // ── Happy-path tests ──────────────────────────────────────────────────────

  it('spawns with full HP and Idle state', () => {
    const { brawler } = makeBrawler();
    expect(brawler.hp).toBe(BRAWLER_MAX_HP);
    expect(brawler.state).toBe(EnemyState.Idle);
  });

  it('transitions to Aggro when player enters aggro radius', () => {
    const { brawler } = makeBrawler({ x: 0 });
    const playerX = BRAWLER_AGGRO_RADIUS - 10;
    // Simulate enough ticks to pass stateTimer > 0 check
    brawler.fixedUpdate(playerX, 150);
    expect(brawler.state).toBe(EnemyState.Aggro);
  });

  it('registers hurtbox with CombatSystem on construction', () => {
    const { combat } = makeBrawler();
    expect(combat.getHurtbox('enemy_test-brawler')).toBeDefined();
  });

  it('takes damage from a CombatSystem hit event', () => {
    const { brawler, combat } = makeBrawler({ x: 0 });
    // Move to Aggro so hurt can interrupt
    brawler.fixedUpdate(BRAWLER_AGGRO_RADIUS - 5, 150);
    const before = brawler.hp;
    combat.dispatchHit('enemy_test-brawler', {
      damage: 10,
      knockbackX: 30,
      knockbackY: 0,
      hitStunFrames: 10,
      attackerFacing: 'right',
      teamTag: 'player',
      isGrab: false,
      isAoe: false,
    });
    expect(brawler.hp).toBe(before - 10);
  });

  it('enters Death state when HP reaches zero', () => {
    const { brawler, combat } = makeBrawler({ x: 0 });
    brawler.fixedUpdate(BRAWLER_AGGRO_RADIUS - 5, 150);
    combat.dispatchHit('enemy_test-brawler', {
      damage: BRAWLER_MAX_HP + 100,
      knockbackX: 30,
      knockbackY: 0,
      hitStunFrames: 10,
      attackerFacing: 'right',
      teamTag: 'player',
      isGrab: false,
      isAoe: false,
    });
    expect(brawler.state).toBe(EnemyState.Death);
  });

  // ── Failure-state tests ────────────────────────────────────────────────────

  it('does NOT aggro when player is outside aggro radius', () => {
    const { brawler } = makeBrawler();
    // sprite.x=100 from mock; 1000 is well outside BRAWLER_AGGRO_RADIUS=160
    brawler.fixedUpdate(1000, 150);
    expect(brawler.state).not.toBe(EnemyState.Aggro);
  });

  it('freeze() prevents state transitions', () => {
    const { brawler } = makeBrawler({ x: 0 });
    brawler.freeze();
    brawler.fixedUpdate(BRAWLER_AGGRO_RADIUS - 10, 150);
    expect(brawler.state).toBe(EnemyState.Idle);
  });

  it('isDead is false until death linger finishes', () => {
    const { brawler, combat } = makeBrawler({ x: 0 });
    brawler.fixedUpdate(BRAWLER_AGGRO_RADIUS - 5, 150);
    combat.dispatchHit('enemy_test-brawler', {
      damage: BRAWLER_MAX_HP + 100,
      knockbackX: 30, knockbackY: 0, hitStunFrames: 10,
      attackerFacing: 'right', teamTag: 'player', isGrab: false, isAoe: false,
    });
    expect(brawler.isDead).toBe(false); // not yet — linger timer
  });

  // ── Edge-case tests ────────────────────────────────────────────────────────

  it('accumulated knockback >= KNOCKDOWN_THRESHOLD triggers Knockdown', () => {
    const { brawler, combat } = makeBrawler({ x: 0 });
    brawler.fixedUpdate(BRAWLER_AGGRO_RADIUS - 5, 150);
    // Multiple small hits that accumulate knockback
    for (let i = 0; i < 5; i++) {
      combat.dispatchHit('enemy_test-brawler', {
        damage: 1,
        knockbackX: 30,
        knockbackY: 0,
        hitStunFrames: 10,
        attackerFacing: 'right',
        teamTag: 'player',
        isGrab: false,
        isAoe: false,
      });
    }
    // 5 × 30 = 150 >= KNOCKDOWN_THRESHOLD (120)
    expect(brawler.state).toBe(EnemyState.Knockdown);
  });

  it('grab attack directly triggers Knockdown even below threshold', () => {
    const { brawler, combat } = makeBrawler({ x: 0 });
    brawler.fixedUpdate(BRAWLER_AGGRO_RADIUS - 5, 150);
    combat.dispatchHit('enemy_test-brawler', {
      damage: 1,
      knockbackX: 5,
      knockbackY: 0,
      hitStunFrames: 10,
      attackerFacing: 'right',
      teamTag: 'player',
      isGrab: true,
      isAoe: false,
    });
    expect(brawler.state).toBe(EnemyState.Knockdown);
  });

  it('does not apply hit when already dead', () => {
    const { brawler, combat } = makeBrawler({ x: 0 });
    brawler.fixedUpdate(BRAWLER_AGGRO_RADIUS - 5, 150);
    combat.dispatchHit('enemy_test-brawler', {
      damage: BRAWLER_MAX_HP + 100,
      knockbackX: 30, knockbackY: 0, hitStunFrames: 10,
      attackerFacing: 'right', teamTag: 'player', isGrab: false, isAoe: false,
    });
    const hpAfterDeath = brawler.hp;
    combat.dispatchHit('enemy_test-brawler', {
      damage: 50, knockbackX: 30, knockbackY: 0, hitStunFrames: 10,
      attackerFacing: 'right', teamTag: 'player', isGrab: false, isAoe: false,
    });
    // HP should not decrease further
    expect(brawler.hp).toBe(hpAfterDeath);
  });
});
