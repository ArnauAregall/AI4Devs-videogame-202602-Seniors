import { describe, it, expect, vi, beforeEach } from 'vitest';

// Phaser mock — must be hoisted before any Phaser-dependent import
const mocks = vi.hoisted(() => {
  const spriteMock = {
    x: 100, y: 150,
    setFlipX: vi.fn(),
    setDepth: vi.fn(),
    setVelocityX: vi.fn(),
    setVelocityY: vi.fn(),
    setCollideWorldBounds: vi.fn(),
    destroy: vi.fn(),
    play: vi.fn(),
  };
  const physicsMock = {
    add: { sprite: vi.fn(() => spriteMock) },
  };
  const sceneMock = {
    physics: physicsMock,
    add: { rectangle: vi.fn(() => ({ x: 0, y: 0, destroy: vi.fn() })), graphics: vi.fn(() => ({ setDepth: vi.fn(), clear: vi.fn(), fillStyle: vi.fn(), fillRect: vi.fn(), destroy: vi.fn() })) },
    events: { emit: vi.fn(), on: vi.fn(), off: vi.fn() },
    anims: { exists: vi.fn(() => true), create: vi.fn(), generateFrameNumbers: vi.fn(() => []) },
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


  it('Y velocity is always set to 0 on hit (no vertical launch)', () => {
    const { brawler, combat } = makeBrawler({ x: 0 });
    brawler.fixedUpdate(BRAWLER_AGGRO_RADIUS - 5, 150);
    mocks.spriteMock.setVelocityY.mockClear();
    combat.dispatchHit('enemy_test-brawler', {
      damage: 5,
      knockbackX: 30,
      knockbackY: -4, // non-zero Y knockback must still be zeroed
      hitStunFrames: 10,
      attackerFacing: 'right',
      teamTag: 'player',
      isGrab: false,
      isAoe: false,
    });
    expect(mocks.spriteMock.setVelocityY).toHaveBeenCalledWith(0);
  });

  // ── FR-EB-01 to FR-EB-06: Animation on state entry (eb-9-2) ─────────────

  it('plays idle animation when spawned (Idle state entry)', () => {
    const { brawler } = makeBrawler();
    // Idle state is entered in the constructor — play should have been called
    expect(mocks.spriteMock.play).toHaveBeenCalledWith('punk-anim-idle', true);
  });

  it('plays walk animation when transitioning to Patrol state', () => {
    const { brawler } = makeBrawler();
    vi.clearAllMocks();
    // Drive idle timer past ENEMY_IDLE_TO_PATROL_FRAMES (60) by ticking many times
    // with player far away (beyond aggro radius) so enemy enters Patrol
    for (let i = 0; i < 65; i++) brawler.fixedUpdate(9999, 150);
    expect(mocks.spriteMock.play).toHaveBeenCalledWith('punk-anim-walk', true);
  });

  it('plays attack animation when transitioning to Attack state', () => {
    const { brawler } = makeBrawler({ x: 100 });
    vi.clearAllMocks();
    // Tick with player adjacent (dist < attackRange) — Idle→Aggro→Attack
    brawler.fixedUpdate(100, 150); // Idle → Aggro (dist=0 <= aggroRadius)
    brawler.fixedUpdate(100, 150); // Aggro → Attack (dist=0 <= attackRange)
    expect(mocks.spriteMock.play).toHaveBeenCalledWith('punk-anim-attack', true);
  });

  it('plays hurt animation when hit and transitioning to Hurt state', () => {
    const { brawler, combat } = makeBrawler({ x: 0 });
    vi.clearAllMocks();
    combat.dispatchHit('enemy_test-brawler', {
      damage: 5, knockbackX: 30, knockbackY: 0,
      hitStunFrames: 10, attackerFacing: 'right', teamTag: 'player',
      isGrab: false, isAoe: false,
    });
    expect(mocks.spriteMock.play).toHaveBeenCalledWith('punk-anim-hurt', true);
  });

  it('plays death animation when HP reaches zero', () => {
    const { brawler, combat } = makeBrawler({ x: 0 });
    // Move to Aggro first (Idle→Death is not a valid FSM transition)
    brawler.fixedUpdate(BRAWLER_AGGRO_RADIUS - 5, 150);
    vi.clearAllMocks();
    // In Aggro state: Aggro→Death IS valid
    combat.dispatchHit('enemy_test-brawler', {
      damage: BRAWLER_MAX_HP, knockbackX: 0, knockbackY: 0,
      hitStunFrames: 0, attackerFacing: 'right', teamTag: 'player',
      isGrab: false, isAoe: false,
    });
    expect(mocks.spriteMock.play).toHaveBeenCalledWith('punk-anim-death', true);
  });

  it('sprite faces right when facing right', () => {
    const { brawler } = makeBrawler({ x: 0 });
    // Player to the right — enemy should face right (setFlipX false)
    brawler.fixedUpdate(BRAWLER_AGGRO_RADIUS - 5, 150);
    expect(mocks.spriteMock.setFlipX).toHaveBeenCalledWith(false);
  });

  it('sprite faces left when player is to the left', () => {
    const { brawler } = makeBrawler({ x: 100 });
    vi.clearAllMocks();
    // Put player within aggro range but to the left → enemy enters Aggro facing left
    // brawler at x=100, player at x=50 → dx = -50 <= aggroRadius(160) → Aggro
    brawler.fixedUpdate(50, 150); // Idle → Aggro (dist=50 <= 160), facingRight=false
    brawler.fixedUpdate(50, 150); // in Aggro, facingRight=false → setFlipX(true)
    const flipXCalls = mocks.spriteMock.setFlipX.mock.calls;
    const lastFlip = flipXCalls[flipXCalls.length - 1]?.[0];
    expect(lastFlip).toBe(true);
  });

  // ── FR-EB-20 to FR-EB-27: Health bar lifecycle (eb-9-2) ─────────────────

  it('creates health bar on spawn (showHealthBar defaults to true)', () => {
    const _ = makeBrawler();
    expect(mocks.sceneMock.add.graphics).toHaveBeenCalled();
  });

  it('updates health bar on every fixedUpdate tick', () => {
    const { brawler } = makeBrawler();
    const graphicsMock = (mocks.sceneMock.add.graphics as ReturnType<typeof vi.fn>).mock.results[0].value;
    vi.clearAllMocks();
    brawler.fixedUpdate(400, 150); // arbitrary
    expect(graphicsMock.clear).toHaveBeenCalled();
    expect(graphicsMock.fillRect).toHaveBeenCalled();
  });

  it('destroys health bar on death', () => {
    const { brawler, combat } = makeBrawler();
    const graphicsMock = (mocks.sceneMock.add.graphics as ReturnType<typeof vi.fn>).mock.results[0].value;
    // Move to Aggro first (Idle→Death is not a valid FSM transition)
    brawler.fixedUpdate(BRAWLER_AGGRO_RADIUS - 5, 150);
    vi.clearAllMocks();
    // In Aggro state: Aggro→Death IS valid
    combat.dispatchHit('enemy_test-brawler', {
      damage: BRAWLER_MAX_HP, knockbackX: 0, knockbackY: 0,
      hitStunFrames: 0, attackerFacing: 'right', teamTag: 'player',
      isGrab: false, isAoe: false,
    });
    expect(graphicsMock.destroy).toHaveBeenCalled();
  });

  it('destroys health bar when destroy() is called on the enemy', () => {
    const { brawler } = makeBrawler();
    const graphicsMock = (mocks.sceneMock.add.graphics as ReturnType<typeof vi.fn>).mock.results[0].value;
    vi.clearAllMocks();
    brawler.destroy();
    expect(graphicsMock.destroy).toHaveBeenCalled();
  });

});
