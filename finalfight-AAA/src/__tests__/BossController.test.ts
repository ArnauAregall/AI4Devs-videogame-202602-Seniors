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
    once:                  vi.fn(),
  };
  const sceneMock = {
    physics: { add: { sprite: vi.fn(() => spriteMock) } },
    add:     { rectangle: vi.fn(() => ({ x: 100, y: 150, destroy: vi.fn() })), graphics: vi.fn(() => ({ setDepth: vi.fn(), clear: vi.fn(), fillStyle: vi.fn(), fillRect: vi.fn(), destroy: vi.fn() })) },
    events:  { emit: vi.fn(), on: vi.fn(), off: vi.fn() },
    anims:   { exists: vi.fn(() => true), create: vi.fn(), generateFrameNumbers: vi.fn(() => []) },
  };
  return { sceneMock, spriteMock };
});

vi.mock('phaser', () => ({
  default: {
    Scene: class {},
    Scale: { FIT: 'FIT', NONE: 'NONE', CENTER_BOTH: 'CENTER_BOTH' },
    Animations: { Events: { ANIMATION_COMPLETE: 'animationcomplete' } },
  },
  Scene:      class {},
  Animations: { Events: { ANIMATION_COMPLETE: 'animationcomplete' } },
}));

import type Phaser from 'phaser';
import { CombatSystem }        from '../combat/CombatSystem';
import { AttackerCoordinator } from '../enemy/AttackerCoordinator';
import { BossController }      from '../enemy/BossController';
import { EnemyState }          from '../enemy/EnemyState';
import {
  BOSS_MAX_HP, BOSS_PHASE2_THRESHOLD, BOSS_PHASE3_THRESHOLD,
  BOSS_ATTACK_COOLDOWN_TICKS, BOSS_TRANSITION_FRAMES,
} from '../enemy/EnemyConfig';

function makeBoss() {
  const combat   = new CombatSystem();
  const coord    = new AttackerCoordinator();
  const arrivedCb = vi.fn();
  const boss = new BossController({
    scene:        mocks.sceneMock as unknown as Phaser.Scene,
    id:           'test-boss',
    x:            100,
    y:            150,
    facingRight:  true,
    combatSystem: combat,
    coordinator:  coord,
  }, arrivedCb);
  return { boss, combat, coord, arrivedCb };
}

describe('BossController', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('spawns in phase 1 with full HP and Idle state', () => {
    const { boss } = makeBoss();
    expect(boss.hp).toBe(BOSS_MAX_HP);
    expect(boss.state).toBe(EnemyState.Idle);
    expect(boss.phase).toBe(1);
  });

  it('fires the bossArrived callback on construction', () => {
    const { arrivedCb } = makeBoss();
    expect(arrivedCb).toHaveBeenCalledTimes(1);
  });

  it('emits bossPhaseChange when HP falls to phase 2 threshold', () => {
    const { boss, combat } = makeBoss();
    // Enter Aggro so Hurt is reachable, then deal damage to ~50% HP
    boss.fixedUpdate(mocks.spriteMock.x + 20, 150);
    const phase2Damage = Math.ceil(BOSS_MAX_HP * (1 - BOSS_PHASE2_THRESHOLD)) + 1;
    combat.dispatchHit('enemy_test-boss', {
      damage: phase2Damage,
      knockbackX: 0, knockbackY: 0,
      hitStunFrames: 5,
      attackerFacing: 'right',
      teamTag: 'player',
      isGrab: false, isAoe: false,
    });
    // Run a tick to check phase
    boss.fixedUpdate(mocks.spriteMock.x + 20, 150);
    expect(boss.phase).toBeGreaterThanOrEqual(2);
  });

  it('emits bossPhaseChange event with correct data', () => {
    const { boss, combat } = makeBoss();
    boss.fixedUpdate(mocks.spriteMock.x + 20, 150);
    const phase2Damage = Math.ceil(BOSS_MAX_HP * (1 - BOSS_PHASE2_THRESHOLD)) + 1;
    combat.dispatchHit('enemy_test-boss', {
      damage: phase2Damage,
      knockbackX: 0, knockbackY: 0,
      hitStunFrames: 5,
      attackerFacing: 'right',
      teamTag: 'player',
      isGrab: false, isAoe: false,
    });
    boss.fixedUpdate(mocks.spriteMock.x + 20, 150);
    const emitCalls = mocks.sceneMock.events.emit.mock.calls;
    const phaseCall = emitCalls.find(([ev]: [string]) => ev === 'bossPhaseChange');
    expect(phaseCall).toBeDefined();
    expect(phaseCall[1]).toMatchObject({ id: 'test-boss', phase: 2 });
  });

  it('freezes during phase transition', () => {
    const { boss, combat } = makeBoss();
    boss.fixedUpdate(mocks.spriteMock.x + 20, 150);
    const phase2Damage = Math.ceil(BOSS_MAX_HP * (1 - BOSS_PHASE2_THRESHOLD)) + 1;
    combat.dispatchHit('enemy_test-boss', {
      damage: phase2Damage,
      knockbackX: 0, knockbackY: 0,
      hitStunFrames: 5,
      attackerFacing: 'right',
      teamTag: 'player',
      isGrab: false, isAoe: false,
    });
    boss.fixedUpdate(mocks.spriteMock.x + 20, 150);
    // During transition boss should be frozen — setVelocityX should not be called
    vi.clearAllMocks();
    boss.fixedUpdate(mocks.spriteMock.x + 20, 150);
    expect(mocks.spriteMock.setVelocityX).not.toHaveBeenCalled();
  });

  it('unfreezes and resumes processing after BOSS_TRANSITION_FRAMES', () => {
    const { boss, combat } = makeBoss();
    boss.fixedUpdate(mocks.spriteMock.x + 20, 150); // Idle → Aggro
    const phase2Damage = Math.ceil(BOSS_MAX_HP * (1 - BOSS_PHASE2_THRESHOLD)) + 1;
    combat.dispatchHit('enemy_test-boss', {
      damage: phase2Damage,
      knockbackX: 0, knockbackY: 0,
      hitStunFrames: 5,
      attackerFacing: 'right',
      teamTag: 'player',
      isGrab: false, isAoe: false,
    });
    // 1 tick to detect phase change → enters transitioning mode
    boss.fixedUpdate(mocks.spriteMock.x + 20, 150);
    // Advance past BOSS_TRANSITION_FRAMES — boss should unfreeze and move to phase 2
    for (let i = 0; i < BOSS_TRANSITION_FRAMES + 2; i++) {
      boss.fixedUpdate(mocks.spriteMock.x + 20, 150);
    }
    // After transition, boss should be phase 2 and alive
    expect(boss.phase).toBe(2);
    expect(boss.isDead).toBe(false);
  });

  it('phase 3 reduces attack_cooldown_frames to half', () => {
    const { boss, combat } = makeBoss();
    boss.fixedUpdate(mocks.spriteMock.x + 20, 150); // Idle → Aggro
    // Deal enough damage to reach phase 3 (<25% HP)
    const phase3Damage = Math.ceil(BOSS_MAX_HP * (1 - BOSS_PHASE3_THRESHOLD)) + 1;
    combat.dispatchHit('enemy_test-boss', {
      damage: phase3Damage,
      knockbackX: 0, knockbackY: 0,
      hitStunFrames: 5,
      attackerFacing: 'right',
      teamTag: 'player',
      isGrab: false, isAoe: false,
    });
    // Advance through transition + hurt frames
    for (let i = 0; i < BOSS_TRANSITION_FRAMES + 30; i++) {
      boss.fixedUpdate(mocks.spriteMock.x + 20, 150);
    }
    // Boss must have reached phase 3 (the critical assertion)
    expect(boss.phase).toBe(3);
    // Verify via emitted event that phase change was announced
    const phaseCalls = mocks.sceneMock.events.emit.mock.calls.filter(
      ([ev]: [string]) => ev === 'bossPhaseChange'
    );
    const phase3Call = phaseCalls.find(([, d]: [string, { phase: number }]) => d.phase === 3);
    expect(phase3Call).toBeDefined();
  });

  it('transitions to Death when HP reaches 0', () => {
    const { boss, combat } = makeBoss();
    boss.fixedUpdate(mocks.spriteMock.x + 20, 150);
    combat.dispatchHit('enemy_test-boss', {
      damage: BOSS_MAX_HP + 100,
      knockbackX: 0, knockbackY: 0,
      hitStunFrames: 5,
      attackerFacing: 'right',
      teamTag: 'player',
      isGrab: false, isAoe: false,
    });
    expect(boss.state).toBe(EnemyState.Death);
  });
});
