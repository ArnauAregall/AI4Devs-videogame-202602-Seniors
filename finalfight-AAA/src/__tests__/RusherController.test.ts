import { describe, it, expect, vi, beforeEach } from 'vitest';

const mocks = vi.hoisted(() => {
  const spriteMock = {
    x: 100, y: 150,
    setFlipX:    vi.fn(),
    setVelocityX: vi.fn(),
    setVelocityY: vi.fn(),
    destroy:      vi.fn(),
  };
  const sceneMock = {
    physics: { add: { sprite: vi.fn(() => spriteMock) } },
    add:     { rectangle: vi.fn(() => ({ x: 0, y: 0, destroy: vi.fn() })) },
    events:  { emit: vi.fn(), on: vi.fn(), off: vi.fn() },
  };
  return { sceneMock, spriteMock };
});

vi.mock('phaser', () => ({
  default: { Scene: class {} },
  Scene:   class {},
}));

import type Phaser from 'phaser';
import { CombatSystem }        from '../combat/CombatSystem';
import { AttackerCoordinator } from '../enemy/AttackerCoordinator';
import { RusherController }    from '../enemy/RusherController';
import { EnemyState }          from '../enemy/EnemyState';
import {
  RUSHER_MAX_HP, RUSHER_AGGRO_RADIUS, RUSHER_CHARGE_SPEED,
  RUSHER_FLURRY_COUNT, RUSHER_ATTACK_COOLDOWN_TICKS,
} from '../enemy/EnemyConfig';

function makeRusher() {
  const combat = new CombatSystem();
  const coord  = new AttackerCoordinator();
  const rusher = new RusherController({
    scene:        mocks.sceneMock as unknown as Phaser.Scene,
    id:           'test-rusher',
    x:            100,
    y:            150,
    facingRight:  true,
    combatSystem: combat,
    coordinator:  coord,
  });
  return { rusher, combat, coord };
}

describe('RusherController', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('spawns with full HP and Idle state', () => {
    const { rusher } = makeRusher();
    expect(rusher.hp).toBe(RUSHER_MAX_HP);
    expect(rusher.state).toBe(EnemyState.Idle);
  });

  it('stays Idle when player is outside aggro radius', () => {
    const { rusher } = makeRusher();
    const farPlayerX = mocks.spriteMock.x + RUSHER_AGGRO_RADIUS + 50;
    rusher.fixedUpdate(farPlayerX, 150);
    expect(rusher.state).toBe(EnemyState.Idle);
  });

  it('transitions to Aggro when player enters aggro radius', () => {
    const { rusher } = makeRusher();
    const nearPlayerX = mocks.spriteMock.x + RUSHER_AGGRO_RADIUS - 10;
    rusher.fixedUpdate(nearPlayerX, 150);
    expect(rusher.state).toBe(EnemyState.Aggro);
  });

  it('charges at RUSHER_CHARGE_SPEED when aggroed and player out of attack range', () => {
    const { rusher } = makeRusher();
    // Keep player outside attack range (32) but inside aggro radius (200)
    const chargeTargetX = mocks.spriteMock.x + 100;
    rusher.fixedUpdate(chargeTargetX, 150); // Idle → Aggro
    vi.clearAllMocks();
    rusher.fixedUpdate(chargeTargetX, 150); // Aggro: dist=100 > 32, charge
    expect(mocks.spriteMock.setVelocityX).toHaveBeenCalledWith(RUSHER_CHARGE_SPEED);
  });

  it('attempts Attack when player is within attack range', () => {
    const { rusher } = makeRusher();
    // Player at dist=20 (< RUSHER_ATTACK_RANGE=32)
    const attackTargetX = mocks.spriteMock.x + 20;
    rusher.fixedUpdate(attackTargetX, 150); // Idle → Aggro
    rusher.fixedUpdate(attackTargetX, 150); // Aggro → Attack
    expect(rusher.state).toBe(EnemyState.Attack);
  });

  it('registers flurry hitboxes up to RUSHER_FLURRY_COUNT', () => {
    const { rusher, combat } = makeRusher();
    const attackTargetX = mocks.spriteMock.x + 20;
    rusher.fixedUpdate(attackTargetX, 150); // Idle → Aggro
    rusher.fixedUpdate(attackTargetX, 150); // Aggro → Attack
    expect(rusher.state).toBe(EnemyState.Attack);

    const registerSpy = vi.spyOn(combat, 'registerHitbox');
    for (let i = 0; i < RUSHER_ATTACK_COOLDOWN_TICKS; i++) {
      rusher.fixedUpdate(attackTargetX, 150);
    }
    expect(registerSpy.mock.calls.length).toBeLessThanOrEqual(RUSHER_FLURRY_COUNT);
    expect(registerSpy.mock.calls.length).toBeGreaterThanOrEqual(1);
  });

  it('returns to Aggro after the attack cooldown expires', () => {
    const { rusher } = makeRusher();
    const attackTargetX = mocks.spriteMock.x + 20;
    rusher.fixedUpdate(attackTargetX, 150); // Idle → Aggro
    rusher.fixedUpdate(attackTargetX, 150); // Aggro → Attack (attackTimer=0)
    // Run exactly RUSHER_ATTACK_COOLDOWN_TICKS ticks to exhaust attack
    // After 90 ticks attackTimer=90, _finishAttack fires → Aggro (before next Aggro tick)
    for (let i = 0; i < RUSHER_ATTACK_COOLDOWN_TICKS; i++) {
      rusher.fixedUpdate(attackTargetX, 150);
    }
    expect(rusher.state).toBe(EnemyState.Aggro);
  });

  it('transitions to Death when HP reaches 0', () => {
    const { rusher, combat } = makeRusher();
    // Move to aggro so Hurt state is reachable
    rusher.fixedUpdate(mocks.spriteMock.x + 20, 150);
    combat.dispatchHit('enemy_test-rusher', {
      damage: RUSHER_MAX_HP + 100,
      knockbackX: 0, knockbackY: 0,
      hitStunFrames: 10,
      attackerFacing: 'right',
      teamTag: 'player',
      isGrab: false, isAoe: false,
    });
    expect(rusher.state).toBe(EnemyState.Death);
  });
});
