/**
 * Boss dual-attack system tests.
 *
 * @spec boss-standard-attack
 * @spec boss-critical-attack
 * @spec boss-controller (MODIFIED — phase probability boosts)
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

const mocks = vi.hoisted(() => {
  const spriteMock = {
    x: 100, y: 150,
    setFlipX:              vi.fn(),
    setDepth:              vi.fn(),
    setVelocityX:          vi.fn(),
    setVelocityY:          vi.fn(),
    setCollideWorldBounds: vi.fn(),
    destroy:               vi.fn(),
    play:                  vi.fn(),
    /** Captures 'once' handlers so tests can fire them manually. */
    _onceHandlers:         {} as Record<string, Array<() => void>>,
    once(event: string, cb: () => void) {
      (this._onceHandlers[event] ??= []).push(cb);
    },
    _fireOnce(event: string) {
      const cbs = this._onceHandlers[event] ?? [];
      this._onceHandlers[event] = [];
      cbs.forEach((cb) => cb());
    },
  };
  const sceneMock = {
    physics: { add: { sprite: vi.fn(() => spriteMock) } },
    add: {
      rectangle: vi.fn(() => ({ x: 100, y: 150, destroy: vi.fn() })),
      graphics:  vi.fn(() => ({ setDepth: vi.fn(), clear: vi.fn(), fillStyle: vi.fn(), fillRect: vi.fn(), destroy: vi.fn() })),
    },
    events: { emit: vi.fn(), on: vi.fn(), off: vi.fn() },
    anims:  { exists: vi.fn(() => true), create: vi.fn(), generateFrameNumbers: vi.fn(() => []) },
  };
  return { sceneMock, spriteMock };
});

vi.mock('phaser', () => ({
  default: {
    Scene: class {},
    Scale: { FIT: 'FIT', NONE: 'NONE', CENTER_BOTH: 'CENTER_BOTH' },
    Animations: { Events: { ANIMATION_COMPLETE: 'animationcomplete' } },
  },
  Scene: class {},
  Animations: { Events: { ANIMATION_COMPLETE: 'animationcomplete' } },
}));

import type Phaser from 'phaser';
import { CombatSystem }        from '../combat/CombatSystem';
import { AttackerCoordinator } from '../enemy/AttackerCoordinator';
import { BossController }      from '../enemy/BossController';
import {
  BOSS_ATTACK_RANGE,
  BOSS_CRITICAL_PROBABILITY,
  BOSS_CRITICAL_COOLDOWN_TICKS,
  BOSS_CRITICAL_DAMAGE,
  BOSS_STANDARD_DAMAGE,
  BOSS_PHASE2_CRITICAL_BOOST,
  BOSS_PHASE3_CRITICAL_BOOST,
  BOSS_PHASE2_THRESHOLD,
  BOSS_PHASE3_THRESHOLD,
  BOSS_MAX_HP,
  BOSS_ANIM_ATTACK,
  BOSS_ANIM_CRITICAL_TELEGRAPH,
  BOSS_ANIM_CRITICAL_ATTACK,
  BOSS_TRANSITION_FRAMES,
  BOSS_ATTACK_STARTUP_FRAMES,
} from '../enemy/EnemyConfig';
import { EnemyState } from '../enemy/EnemyState';

function makeBoss() {
  const combat = new CombatSystem();
  const coord  = new AttackerCoordinator();
  const boss   = new BossController({
    scene:        mocks.sceneMock as unknown as Phaser.Scene,
    id:           'boss-atk-test',
    x:            100,
    y:            150,
    facingRight:  true,
    combatSystem: combat,
    coordinator:  coord,
  });
  return { boss, combat, coord };
}

/** Advance the boss from Idle → Aggro → Attack (player placed in attack range). */
function enterAttack(boss: BossController) {
  const playerX = mocks.spriteMock.x + BOSS_ATTACK_RANGE - 5; // just inside range
  // tick 1: Idle → Aggro (player within aggro radius)
  boss.fixedUpdate(playerX, mocks.spriteMock.y);
  // tick 2: Aggro → Attack
  boss.fixedUpdate(playerX, mocks.spriteMock.y);
}

describe('BossController — standard attack', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.spriteMock._onceHandlers = {};
  });

  it('plays BOSS_ANIM_ATTACK when probability gate rejects critical', () => {
    vi.spyOn(Math, 'random').mockReturnValue(BOSS_CRITICAL_PROBABILITY + 0.1); // above threshold
    const { boss } = makeBoss();
    enterAttack(boss);
    expect(boss.state).toBe(EnemyState.Attack);
    const playCalls = mocks.spriteMock.play.mock.calls.map(([k]: [string]) => k);
    expect(playCalls).toContain(BOSS_ANIM_ATTACK);
    expect(playCalls).not.toContain(BOSS_ANIM_CRITICAL_TELEGRAPH);
  });

  it('registers a hitbox with standard damage after startup frames', () => {
    vi.spyOn(Math, 'random').mockReturnValue(1); // always standard
    const { boss, combat } = makeBoss();
    const registerSpy = vi.spyOn(combat, 'registerHitbox');
    enterAttack(boss);
    // advance past startup frames
    const playerX = mocks.spriteMock.x + BOSS_ATTACK_RANGE - 5;
    for (let i = 0; i < BOSS_ATTACK_STARTUP_FRAMES + 1; i++) {
      boss.fixedUpdate(playerX, mocks.spriteMock.y);
    }
    expect(registerSpy).toHaveBeenCalled();
    const [,, , damage] = registerSpy.mock.calls[0];
    expect(damage).toBe(BOSS_STANDARD_DAMAGE);
  });
});

describe('BossController — critical attack', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.spriteMock._onceHandlers = {};
  });

  it('plays BOSS_ANIM_CRITICAL_TELEGRAPH when probability gate passes and cooldown is 0', () => {
    vi.spyOn(Math, 'random').mockReturnValue(BOSS_CRITICAL_PROBABILITY - 0.01); // below threshold
    const { boss } = makeBoss();
    enterAttack(boss);
    expect(boss.state).toBe(EnemyState.Attack);
    const playCalls = mocks.spriteMock.play.mock.calls.map(([k]: [string]) => k);
    expect(playCalls).toContain(BOSS_ANIM_CRITICAL_TELEGRAPH);
  });

  it('does NOT register a hitbox during telegraph phase', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0); // always critical
    const { boss, combat } = makeBoss();
    const registerSpy = vi.spyOn(combat, 'registerHitbox');
    enterAttack(boss);
    // Advance a few ticks — still in telegraph, no animationcomplete fired
    const playerX = mocks.spriteMock.x + BOSS_ATTACK_RANGE - 5;
    for (let i = 0; i < BOSS_ATTACK_STARTUP_FRAMES + 5; i++) {
      boss.fixedUpdate(playerX, mocks.spriteMock.y);
    }
    expect(registerSpy).not.toHaveBeenCalled();
  });

  it('transitions to BOSS_ANIM_CRITICAL_ATTACK after telegraph completes', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    const { boss } = makeBoss();
    enterAttack(boss);
    // Fire the animationcomplete once-handler to simulate animation end
    mocks.spriteMock._fireOnce('animationcomplete');
    const playCalls = mocks.spriteMock.play.mock.calls.map(([k]: [string]) => k);
    expect(playCalls).toContain(BOSS_ANIM_CRITICAL_ATTACK);
  });

  it('registers a hitbox with BOSS_CRITICAL_DAMAGE during critical active phase', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    const { boss, combat } = makeBoss();
    const registerSpy = vi.spyOn(combat, 'registerHitbox');
    enterAttack(boss);
    // Fire animationcomplete to enter crit-active phase
    mocks.spriteMock._fireOnce('animationcomplete');
    // Advance past startup
    const playerX = mocks.spriteMock.x + BOSS_ATTACK_RANGE - 5;
    for (let i = 0; i < BOSS_ATTACK_STARTUP_FRAMES + 1; i++) {
      boss.fixedUpdate(playerX, mocks.spriteMock.y);
    }
    expect(registerSpy).toHaveBeenCalled();
    const [,, , damage] = registerSpy.mock.calls[0];
    expect(damage).toBe(BOSS_CRITICAL_DAMAGE);
  });

  it('sets _criticalCooldownTicks to BOSS_CRITICAL_COOLDOWN_TICKS on telegraph entry', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    const { boss } = makeBoss();
    enterAttack(boss);
    // After entering telegraph the cooldown should be set
    // We verify by checking that after cooldown many ticks outside attack, it reaches 0
    // Exit attack by advancing past cooldown (standard escape via finishAttack), then count ticks
    // Simpler: fire animationcomplete → crit active → let it finish, then count down
    mocks.spriteMock._fireOnce('animationcomplete');
    const playerX = mocks.spriteMock.x + BOSS_ATTACK_RANGE - 5;
    // Advance far enough to finish the attack
    for (let i = 0; i < 200; i++) {
      boss.fixedUpdate(playerX, mocks.spriteMock.y);
    }
    // Now outside attack state, cooldown should be decrementing — still > 0 after only 200 ticks
    // BOSS_CRITICAL_COOLDOWN_TICKS = 300, so it shouldn't be 0 yet
    // Try to trigger critical again — random returns 0 but cooldown blocks it
    vi.clearAllMocks();
    mocks.spriteMock._onceHandlers = {};
    // Move player away then back in range to trigger a new attack
    boss.fixedUpdate(mocks.spriteMock.x + 300, mocks.spriteMock.y); // out of range
    boss.fixedUpdate(playerX, mocks.spriteMock.y); // back in range
    const playCalls = mocks.spriteMock.play.mock.calls.map(([k]: [string]) => k);
    // Critical should be blocked — standard animation only
    expect(playCalls).not.toContain(BOSS_ANIM_CRITICAL_TELEGRAPH);
  });

  it('blocks critical attack when cooldown > 0', () => {
    // First critical attack to set cooldown
    vi.spyOn(Math, 'random').mockReturnValue(0);
    const { boss } = makeBoss();
    enterAttack(boss);
    mocks.spriteMock._fireOnce('animationcomplete');
    const playerX = mocks.spriteMock.x + BOSS_ATTACK_RANGE - 5;
    for (let i = 0; i < 100; i++) {
      boss.fixedUpdate(playerX, mocks.spriteMock.y);
    }
    // Cooldown is now < BOSS_CRITICAL_COOLDOWN_TICKS ticks from now — still > 0
    // Move out then back in to trigger another attack
    vi.clearAllMocks();
    mocks.spriteMock._onceHandlers = {};
    boss.fixedUpdate(mocks.spriteMock.x + 400, mocks.spriteMock.y);
    boss.fixedUpdate(playerX, mocks.spriteMock.y);
    const playCalls = mocks.spriteMock.play.mock.calls.map(([k]: [string]) => k);
    expect(playCalls).not.toContain(BOSS_ANIM_CRITICAL_TELEGRAPH);
  });
});

describe('BossController — critical probability phase boosts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.spriteMock._onceHandlers = {};
  });

  it('BOSS_STANDARD_DAMAGE is less than BOSS_CRITICAL_DAMAGE', () => {
    expect(BOSS_STANDARD_DAMAGE).toBeLessThan(BOSS_CRITICAL_DAMAGE);
  });

  it('BOSS_PHASE2_CRITICAL_BOOST and BOSS_PHASE3_CRITICAL_BOOST are positive', () => {
    expect(BOSS_PHASE2_CRITICAL_BOOST).toBeGreaterThan(0);
    expect(BOSS_PHASE3_CRITICAL_BOOST).toBeGreaterThan(0);
  });

  it('phase 2 increases effective critical probability', () => {
    const { boss, combat } = makeBoss();
    // Place player FAR away so boss never attacks — then deal phase 2 damage and transition.
    const farX = mocks.spriteMock.x + 400;
    boss.fixedUpdate(farX, 150); // Idle → Aggro
    const phase2Damage = Math.ceil(BOSS_MAX_HP * (1 - BOSS_PHASE2_THRESHOLD)) + 1;
    combat.dispatchHit('enemy_boss-atk-test', {
      damage: phase2Damage,
      knockbackX: 0, knockbackY: 0, hitStunFrames: 5,
      attackerFacing: 'right', teamTag: 'player', isGrab: false, isAoe: false,
    });
    // Advance through transition — player stays far so boss NEVER attacks.
    for (let i = 0; i < BOSS_TRANSITION_FRAMES + 30; i++) {
      boss.fixedUpdate(farX, 150);
    }
    expect(boss.phase).toBeGreaterThanOrEqual(2);
    // Boss has never attacked, so criticalCooldownTicks === 0.
    // Set random to just above base probability but below boosted probability.
    const justAboveBase = BOSS_CRITICAL_PROBABILITY + BOSS_PHASE2_CRITICAL_BOOST * 0.5;
    vi.spyOn(Math, 'random').mockReturnValue(justAboveBase);
    vi.clearAllMocks();
    mocks.spriteMock._onceHandlers = {};
    // Now bring player in range — boss should use boosted probability → critical.
    const playerX = mocks.spriteMock.x + BOSS_ATTACK_RANGE - 5;
    boss.fixedUpdate(playerX, mocks.spriteMock.y); // Aggro → Attack
    boss.fixedUpdate(playerX, mocks.spriteMock.y);
    const playCalls = mocks.spriteMock.play.mock.calls.map(([k]: [string]) => k);
    expect(playCalls).toContain(BOSS_ANIM_CRITICAL_TELEGRAPH);
  });

  it('phase 3 further increases effective critical probability', () => {
    const { boss, combat } = makeBoss();
    const farX = mocks.spriteMock.x + 400;
    boss.fixedUpdate(farX, 150);
    const phase3Damage = Math.ceil(BOSS_MAX_HP * (1 - BOSS_PHASE3_THRESHOLD)) + 1;
    combat.dispatchHit('enemy_boss-atk-test', {
      damage: phase3Damage,
      knockbackX: 0, knockbackY: 0, hitStunFrames: 5,
      attackerFacing: 'right', teamTag: 'player', isGrab: false, isAoe: false,
    });
    for (let i = 0; i < BOSS_TRANSITION_FRAMES + 30; i++) {
      boss.fixedUpdate(farX, 150);
    }
    expect(boss.phase).toBe(3);
    // Random just below the full phase-3 probability (base + phase2 boost + phase3 boost).
    const fullBoost = BOSS_CRITICAL_PROBABILITY + BOSS_PHASE2_CRITICAL_BOOST + BOSS_PHASE3_CRITICAL_BOOST;
    vi.spyOn(Math, 'random').mockReturnValue(fullBoost - 0.01);
    vi.clearAllMocks();
    mocks.spriteMock._onceHandlers = {};
    const playerX = mocks.spriteMock.x + BOSS_ATTACK_RANGE - 5;
    boss.fixedUpdate(playerX, mocks.spriteMock.y);
    boss.fixedUpdate(playerX, mocks.spriteMock.y);
    const playCalls = mocks.spriteMock.play.mock.calls.map(([k]: [string]) => k);
    expect(playCalls).toContain(BOSS_ANIM_CRITICAL_TELEGRAPH);
  });
});
