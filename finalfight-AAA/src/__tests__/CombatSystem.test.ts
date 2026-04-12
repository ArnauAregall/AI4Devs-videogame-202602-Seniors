import { describe, it, expect, beforeEach } from 'vitest';

// No Phaser dependency — CombatSystem is pure logic
import { CombatSystem } from '../combat/CombatSystem';
import { HitEvent } from '../combat/HitEvent';
import {
  PLAYER_JAB_DAMAGE,
  PLAYER_LIGHT_KNOCKBACK_X,
  LIGHT_HIT_STUN_FRAMES,
} from '../combat/CombatConfig';

const PLAYER_HITBOX = { x: 100, y: 100, w: 30, h: 20 };
const ENEMY_HURTBOX = { x: 110, y: 100, w: 24, h: 48 };
const FAR_HURTBOX   = { x: 300, y: 100, w: 24, h: 48 };

describe('CombatSystem — hit detection', () => {
  let combat: CombatSystem;
  let hits: Array<{ targetId: string; event: HitEvent }>;

  beforeEach(() => {
    combat = new CombatSystem();
    hits = [];
    combat.onHit((id, ev) => hits.push({ targetId: id, event: ev }));
  });

  it('registers a hit when player hitbox overlaps enemy hurtbox', () => {
    combat.registerHurtbox('enemy1', ENEMY_HURTBOX, 'enemy');
    combat.registerHitbox('phx1', PLAYER_HITBOX, 'player', PLAYER_JAB_DAMAGE, PLAYER_LIGHT_KNOCKBACK_X, 0, LIGHT_HIT_STUN_FRAMES, 'right');

    combat.fixedUpdate();

    expect(hits).toHaveLength(1);
    expect(hits[0].targetId).toBe('enemy1');
    expect(hits[0].event.damage).toBeGreaterThan(0);
  });

  it('ignores same-team hitbox-hurtbox overlap', () => {
    combat.registerHurtbox('player', ENEMY_HURTBOX, 'player');
    combat.registerHitbox('phx1', PLAYER_HITBOX, 'player', PLAYER_JAB_DAMAGE, PLAYER_LIGHT_KNOCKBACK_X, 0, LIGHT_HIT_STUN_FRAMES, 'right');

    combat.fixedUpdate();

    expect(hits).toHaveLength(0);
  });

  it('does not hit when rects do not overlap', () => {
    combat.registerHurtbox('enemy1', FAR_HURTBOX, 'enemy');
    combat.registerHitbox('phx1', PLAYER_HITBOX, 'player', PLAYER_JAB_DAMAGE, PLAYER_LIGHT_KNOCKBACK_X, 0, LIGHT_HIT_STUN_FRAMES, 'right');

    combat.fixedUpdate();

    expect(hits).toHaveLength(0);
  });

  it('one-hit-per-swing guard: second tick with same hitbox does not re-hit', () => {
    combat.registerHurtbox('enemy1', ENEMY_HURTBOX, 'enemy');
    combat.registerHitbox('phx1', PLAYER_HITBOX, 'player', PLAYER_JAB_DAMAGE, PLAYER_LIGHT_KNOCKBACK_X, 0, LIGHT_HIT_STUN_FRAMES, 'right');

    combat.fixedUpdate();
    combat.fixedUpdate();

    expect(hits).toHaveLength(1); // only one hit
  });

  it('hit guard resets when hitbox is removed and re-registered', () => {
    combat.registerHurtbox('enemy1', ENEMY_HURTBOX, 'enemy');
    combat.registerHitbox('phx1', PLAYER_HITBOX, 'player', PLAYER_JAB_DAMAGE, PLAYER_LIGHT_KNOCKBACK_X, 0, LIGHT_HIT_STUN_FRAMES, 'right');

    combat.fixedUpdate();
    combat.removeHitbox('phx1');
    combat.registerHitbox('phx1', PLAYER_HITBOX, 'player', PLAYER_JAB_DAMAGE, PLAYER_LIGHT_KNOCKBACK_X, 0, LIGHT_HIT_STUN_FRAMES, 'right');
    combat.fixedUpdate();

    expect(hits).toHaveLength(2);
  });

  it('AoE hitbox hits multiple enemies simultaneously', () => {
    const ENEMY_HURTBOX_2 = { x: 115, y: 100, w: 24, h: 48 };
    combat.registerHurtbox('enemy1', ENEMY_HURTBOX, 'enemy');
    combat.registerHurtbox('enemy2', ENEMY_HURTBOX_2, 'enemy');
    combat.registerHitbox('phx_aoe', PLAYER_HITBOX, 'player', PLAYER_JAB_DAMAGE, PLAYER_LIGHT_KNOCKBACK_X, 0, LIGHT_HIT_STUN_FRAMES, 'right', true);

    combat.fixedUpdate();

    expect(hits).toHaveLength(2);
    expect(hits.map(h => h.targetId).sort()).toEqual(['enemy1', 'enemy2'].sort());
  });

  it('AoE hitbox still only hits each enemy once per activation', () => {
    combat.registerHurtbox('enemy1', ENEMY_HURTBOX, 'enemy');
    combat.registerHitbox('phx_aoe', PLAYER_HITBOX, 'player', PLAYER_JAB_DAMAGE, PLAYER_LIGHT_KNOCKBACK_X, 0, LIGHT_HIT_STUN_FRAMES, 'right', true);

    combat.fixedUpdate();
    combat.fixedUpdate();

    expect(hits).toHaveLength(1);
  });

  it('knockback direction is negated for left-facing attacker', () => {
    combat.registerHurtbox('enemy1', ENEMY_HURTBOX, 'enemy');
    combat.registerHitbox('phx_left', PLAYER_HITBOX, 'player', PLAYER_JAB_DAMAGE, PLAYER_LIGHT_KNOCKBACK_X, 0, LIGHT_HIT_STUN_FRAMES, 'left');

    combat.fixedUpdate();

    expect(hits[0].event.knockbackX).toBe(-PLAYER_LIGHT_KNOCKBACK_X);
  });

  it('knockback is positive for right-facing attacker', () => {
    combat.registerHurtbox('enemy1', ENEMY_HURTBOX, 'enemy');
    combat.registerHitbox('phx_right', PLAYER_HITBOX, 'player', PLAYER_JAB_DAMAGE, PLAYER_LIGHT_KNOCKBACK_X, 0, LIGHT_HIT_STUN_FRAMES, 'right');

    combat.fixedUpdate();

    expect(hits[0].event.knockbackX).toBe(PLAYER_LIGHT_KNOCKBACK_X);
  });

  it('invincible hurtbox is not hit', () => {
    combat.registerHurtbox('enemy1', ENEMY_HURTBOX, 'enemy');
    const hb = combat.getHurtbox('enemy1')!;
    hb.invincible = true;
    combat.registerHitbox('phx1', PLAYER_HITBOX, 'player', PLAYER_JAB_DAMAGE, PLAYER_LIGHT_KNOCKBACK_X, 0, LIGHT_HIT_STUN_FRAMES, 'right');

    combat.fixedUpdate();

    expect(hits).toHaveLength(0);
  });

  it('removed hurtbox is not targetable', () => {
    combat.registerHurtbox('enemy1', ENEMY_HURTBOX, 'enemy');
    combat.removeHurtbox('enemy1');
    combat.registerHitbox('phx1', PLAYER_HITBOX, 'player', PLAYER_JAB_DAMAGE, PLAYER_LIGHT_KNOCKBACK_X, 0, LIGHT_HIT_STUN_FRAMES, 'right');

    combat.fixedUpdate();

    expect(hits).toHaveLength(0);
  });
});

describe('CombatSystem — tryGrab', () => {
  let combat: CombatSystem;
  let hits: Array<{ targetId: string; event: HitEvent }>;

  beforeEach(() => {
    combat = new CombatSystem();
    hits = [];
    combat.onHit((id, ev) => hits.push({ targetId: id, event: ev }));
  });

  it('grab succeeds when enemy is within range', () => {
    // Register attacker hurtbox (player) so tryGrab knows team
    combat.registerHurtbox('player', { x: 85, y: 121, w: 24, h: 48 }, 'player');
    // Enemy center at (110, 145), player at (97, 145) — dx=13, dy=0 → within GRAB_RANGE=28, GRAB_HEIGHT_TOLERANCE=24
    combat.registerHurtbox('enemy1', { x: 98, y: 121, w: 24, h: 48 }, 'enemy');

    const result = combat.tryGrab('player', 97, 145, 'right');

    expect(result).not.toBeNull();
    expect(result!.isGrab).toBe(true);
    expect(hits).toHaveLength(1);
    expect(hits[0].event.isGrab).toBe(true);
  });

  it('grab fails when no enemy is in range', () => {
    combat.registerHurtbox('player', { x: 85, y: 121, w: 24, h: 48 }, 'player');
    combat.registerHurtbox('enemy1', FAR_HURTBOX, 'enemy');

    const result = combat.tryGrab('player', 97, 145, 'right');

    expect(result).toBeNull();
    expect(hits).toHaveLength(0);
  });

  it('grab grants invincibility to attacker', () => {
    combat.registerHurtbox('player', { x: 85, y: 121, w: 24, h: 48 }, 'player');
    combat.registerHurtbox('enemy1', { x: 98, y: 121, w: 24, h: 48 }, 'enemy');

    combat.tryGrab('player', 97, 145, 'right');

    const playerHb = combat.getHurtbox('player')!;
    expect(playerHb.invincible).toBe(true);
  });
});
