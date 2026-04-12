import { describe, it, expect, vi, beforeEach } from 'vitest';

// vi.hoisted runs before vi.mock — lets us share objects across both
const mocks = vi.hoisted(() => {
  const spriteMock = {
    x: 0, y: 0,
    setFlipX: vi.fn(),
    play: vi.fn(),
    anims: { setRepeat: vi.fn(), currentAnim: null },
    on: vi.fn(),
    off: vi.fn(),
    destroy: vi.fn(),
    scene: null as unknown,
  };

  const hitboxMock = { setPosition: vi.fn(), destroy: vi.fn() };

  const sceneMock = {
    input:   { keyboard: { addKey: vi.fn(() => ({ isDown: false })), on: vi.fn() }, gamepad: { on: vi.fn(), pad1: null } },
    physics: { add: { sprite: vi.fn(() => spriteMock), staticGroup: vi.fn(() => ({ create: vi.fn(() => hitboxMock) })) } },
    anims:   { exists: vi.fn(() => true), create: vi.fn(), generateFrameNumbers: vi.fn(() => []) },
    registerFixedUpdate:   vi.fn(),
    unregisterFixedUpdate: vi.fn(),
    triggerGameOver:       vi.fn(),
    playerHitboxGroup:     { create: vi.fn(() => hitboxMock) },
  };
  spriteMock.scene = sceneMock;
  return { spriteMock, sceneMock };
});

vi.mock('phaser', () => ({
  default: {
    Scene: class {},
    Input: { Keyboard: { KeyCodes: { LEFT:'L',RIGHT:'R',UP:'U',DOWN:'D',A:'A',D:'D2',W:'W',S:'S',Z:'Z',J:'J',X:'X',K:'K',C:'C',L:'L2',SPACE:'SP',ENTER:'EN' }, JustDown: vi.fn(() => false) }, Gamepad: {} },
    Math: { Clamp: (v: number, lo: number, hi: number) => Math.min(Math.max(v, lo), hi) },
    AUTO: 0,
    Scale: { FIT: 'FIT', NONE: 'NONE', CENTER_BOTH: 'CENTER_BOTH' },
  },
  Scene: class {},
}));

import { GameConfig } from '../config/GameConfig';
import { PlayerState } from '../player/PlayerState';
import { PlayerController } from '../player/PlayerController';

describe('PlayerHealth', () => {
  let controller: PlayerController;

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.spriteMock.x = 0;
    mocks.spriteMock.y = 0;
    // Restore the sprite mock return after clearAllMocks resets it
    (mocks.sceneMock.physics.add.sprite as ReturnType<typeof vi.fn>).mockReturnValue(mocks.spriteMock);
    controller = new PlayerController(mocks.sceneMock as unknown as Parameters<typeof PlayerController>[0], 100, 150);
  });

  // ── Initial state ──────────────────────────────────────────────────────
  it('starts with full HP equal to PLAYER_MAX_HP', () => {
    expect(controller.hp).toBe(GameConfig.PLAYER_MAX_HP);
    expect(controller.maxHp).toBe(GameConfig.PLAYER_MAX_HP);
  });

  it('starts with PLAYER_LIVES lives', () => {
    expect(controller.lives).toBe(GameConfig.PLAYER_LIVES);
  });

  it('starts with 0 iFrames', () => {
    expect(controller.iFramesRemaining).toBe(0);
  });

  // ── takeDamage normal ──────────────────────────────────────────────────
  it('reduces HP by the given amount when not invincible', () => {
    controller.takeDamage(20);
    expect(controller.hp).toBe(GameConfig.PLAYER_MAX_HP - 20);
  });

  it('does not reduce HP below 0', () => {
    controller.takeDamage(999);
    expect(controller.hp).toBeGreaterThanOrEqual(0);
  });

  // ── takeDamage blocked by iFrames ──────────────────────────────────────
  it('ignores damage when iFramesRemaining > 0', () => {
    controller.iFramesRemaining = 10;
    controller.takeDamage(30);
    expect(controller.hp).toBe(GameConfig.PLAYER_MAX_HP);
  });

  // ── Death → respawn ────────────────────────────────────────────────────
  it('decrements lives and restores HP on death (lives > 0)', () => {
    controller.takeDamage(GameConfig.PLAYER_MAX_HP);
    expect(controller.lives).toBe(GameConfig.PLAYER_LIVES - 1);
    expect(controller.hp).toBe(GameConfig.PLAYER_MAX_HP);
  });

  it('grants RESPAWN_IFRAMES on respawn', () => {
    controller.takeDamage(GameConfig.PLAYER_MAX_HP);
    expect(controller.iFramesRemaining).toBe(GameConfig.RESPAWN_IFRAMES);
  });

  // ── Death on last life → triggerGameOver ──────────────────────────────
  it('calls scene.triggerGameOver() when the last life is lost', () => {
    controller.lives = 0;
    controller.takeDamage(GameConfig.PLAYER_MAX_HP);
    expect(mocks.sceneMock.triggerGameOver).toHaveBeenCalledOnce();
  });

  it('does NOT call triggerGameOver when lives > 0', () => {
    controller.takeDamage(GameConfig.PLAYER_MAX_HP);
    expect(mocks.sceneMock.triggerGameOver).not.toHaveBeenCalled();
  });

  // ── iFrames granted on GetUp ───────────────────────────────────────────
  it('grants GETUP_IFRAMES when entering GetUp state via state machine', () => {
    controller.iFramesRemaining = 0;
    const fsm = (controller as unknown as { _stateMachine: { current: PlayerState; transition: (s: PlayerState) => boolean } })._stateMachine;
    fsm.current = PlayerState.Knockdown;
    fsm.transition(PlayerState.GetUp);
    expect(controller.iFramesRemaining).toBe(GameConfig.GETUP_IFRAMES);
  });
});
