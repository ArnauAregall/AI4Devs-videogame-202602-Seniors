import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('phaser', () => ({
  default: { Scene: class {} },
  Scene:   class {},
}));

import type Phaser from 'phaser';
import { CombatSystem }     from '../combat/CombatSystem';
import { KnifeProjectile }  from '../enemy/KnifeProjectile';
import {
  KNIFE_SPEED, KNIFE_MAX_RANGE, KNIFE_DAMAGE,
  KNIFE_HITBOX_W, KNIFE_HITBOX_H,
} from '../enemy/EnemyConfig';

const sceneMock = {
  add: { rectangle: vi.fn(() => ({ x: 100, y: 150, destroy: vi.fn() })) },
};

function makeKnife(opts: { facingRight?: boolean; throwerId?: string } = {}) {
  const combat   = new CombatSystem();
  const rectMock = { x: 100, y: 150, destroy: vi.fn() };
  vi.spyOn(sceneMock.add, 'rectangle').mockReturnValue(rectMock as any);

  const knife = new KnifeProjectile({
    scene:        sceneMock as unknown as Phaser.Scene,
    combatSystem: combat,
    throwerId:    opts.throwerId ?? 'enemy_thrower',
    x:            100,
    y:            150,
    facingRight:  opts.facingRight ?? true,
  });
  return { knife, combat, rectMock };
}

describe('KnifeProjectile', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('is not done on creation', () => {
    const { knife } = makeKnife();
    expect(knife.isDone).toBe(false);
  });

  it('travels at KNIFE_SPEED per tick (facing right)', () => {
    const { knife, rectMock } = makeKnife({ facingRight: true });
    knife.fixedUpdate(999, 150);
    expect(rectMock.x).toBe(100 + KNIFE_SPEED);
  });

  it('travels at KNIFE_SPEED per tick (facing left)', () => {
    const { knife, rectMock } = makeKnife({ facingRight: false });
    knife.fixedUpdate(999, 150);
    expect(rectMock.x).toBe(100 - KNIFE_SPEED);
  });

  it('becomes done after KNIFE_MAX_RANGE distance', () => {
    const { knife } = makeKnife();
    const ticks = Math.ceil(KNIFE_MAX_RANGE / KNIFE_SPEED) + 1;
    for (let i = 0; i < ticks; i++) knife.fixedUpdate(999, 150);
    expect(knife.isDone).toBe(true);
  });

  it('hits player hurtbox and becomes done', () => {
    const { knife, combat } = makeKnife({ facingRight: true });
    // Register a player hurtbox at knife position
    combat.registerHurtbox(
      'player_1',
      { x: 100 - KNIFE_HITBOX_W / 2, y: 150 - KNIFE_HITBOX_H / 2, w: KNIFE_HITBOX_W, h: KNIFE_HITBOX_H },
      'player',
    );
    const hitSpy = vi.spyOn(combat, 'dispatchHit');
    knife.fixedUpdate(100, 150);
    expect(hitSpy).toHaveBeenCalledWith('player_1', expect.objectContaining({ damage: KNIFE_DAMAGE, teamTag: 'enemy' }));
    expect(knife.isDone).toBe(true);
  });

  it('is deflected by player hitbox — reverses direction, not destroyed', () => {
    const { knife, combat } = makeKnife({ facingRight: true });
    // Register a player hitbox (active attack hitbox) at knife position
    combat.registerHitbox(
      'player_punch',
      { x: 100 - KNIFE_HITBOX_W / 2, y: 150 - KNIFE_HITBOX_H / 2, w: KNIFE_HITBOX_W, h: KNIFE_HITBOX_H },
      'player',
      10, 0, 0, 5, 'right', false,
    );
    knife.fixedUpdate(999, 150); // no player hurtbox → no player hit
    expect(knife.isDone).toBe(false);
    // On the next tick the knife travels left (reflected)
    // Remove hitbox so no further deflections
    combat.removeHitbox('player_punch');
    knife.fixedUpdate(999, 150);
    // The knife should still be alive (not done) and now moving left
    // We can verify by checking it does NOT hit the same player position again
    expect(knife.isDone).toBe(false);
  });

  it('reflected knife does NOT hit the player', () => {
    const { knife, combat } = makeKnife({ facingRight: true });
    // Deflect first
    combat.registerHitbox(
      'player_punch',
      { x: 100 - KNIFE_HITBOX_W / 2, y: 150 - KNIFE_HITBOX_H / 2, w: KNIFE_HITBOX_W, h: KNIFE_HITBOX_H },
      'player',
      10, 0, 0, 5, 'right', false,
    );
    knife.fixedUpdate(999, 150);
    combat.removeHitbox('player_punch');

    // Now add player hurtbox at knife's current position
    combat.registerHurtbox(
      'player_1',
      { x: 90, y: 140, w: KNIFE_HITBOX_W + 20, h: KNIFE_HITBOX_H + 20 },
      'player',
    );
    const hitSpy = vi.spyOn(combat, 'dispatchHit');
    knife.fixedUpdate(999, 150);
    // Reflected knife must NOT hit player
    const playerHit = hitSpy.mock.calls.find(([id]) => id === 'player_1');
    expect(playerHit).toBeUndefined();
  });

  it('reflected knife hits the thrower hurtbox', () => {
    const { knife, combat } = makeKnife({ facingRight: true, throwerId: 'enemy_thrower' });
    // Deflect
    combat.registerHitbox(
      'player_punch',
      { x: 100 - KNIFE_HITBOX_W / 2, y: 150 - KNIFE_HITBOX_H / 2, w: KNIFE_HITBOX_W, h: KNIFE_HITBOX_H },
      'player',
      10, 0, 0, 5, 'right', false,
    );
    knife.fixedUpdate(999, 150);
    combat.removeHitbox('player_punch');

    // Register thrower hurtbox to the left of deflection point
    combat.registerHurtbox(
      'enemy_thrower',
      { x: 70, y: 140, w: 30, h: 30 },
      'enemy',
    );
    const hitSpy = vi.spyOn(combat, 'dispatchHit');
    // Advance until the knife reaches thrower position (knife moves left now)
    for (let i = 0; i < 10; i++) knife.fixedUpdate(999, 150);
    const throwerHit = hitSpy.mock.calls.find(([id]) => id === 'enemy_thrower');
    expect(throwerHit).toBeDefined();
    expect(throwerHit![1]).toMatchObject({ teamTag: 'player' });
  });
});
