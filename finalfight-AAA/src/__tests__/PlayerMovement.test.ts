import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GameConfig } from '../config/GameConfig';

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

import { PlayerController } from '../player/PlayerController';

describe('PlayerMovement', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.spriteMock.x = 0;
    mocks.spriteMock.y = 0;
    (mocks.sceneMock.physics.add.sprite as ReturnType<typeof vi.fn>).mockReturnValue(mocks.spriteMock);
  });

  // ── Walk speed ≤ camera speed (constant check, no controller needed) ───
  it('PLAYER_WALK_SPEED does not exceed CAMERA_MAX_SCROLL_SPEED', () => {
    expect(GameConfig.PLAYER_WALK_SPEED).toBeLessThanOrEqual(GameConfig.CAMERA_MAX_SCROLL_SPEED);
  });

  // ── Ground clamping ────────────────────────────────────────────────────
  it('clamps sprite.y to GROUND_TOP when spawned above the ground plane', () => {
    const controller = new PlayerController(
      mocks.sceneMock as unknown as Parameters<typeof PlayerController>[0],
      100,
      GameConfig.GROUND_TOP - 20,
    );
    controller.fixedUpdate(GameConfig.FIXED_DELTA_MS);
    expect(mocks.spriteMock.y).toBeGreaterThanOrEqual(GameConfig.GROUND_TOP);
  });

  it('clamps sprite.y to GROUND_BOTTOM when spawned below the ground plane', () => {
    const controller = new PlayerController(
      mocks.sceneMock as unknown as Parameters<typeof PlayerController>[0],
      100,
      GameConfig.GROUND_BOTTOM + 20,
    );
    controller.fixedUpdate(GameConfig.FIXED_DELTA_MS);
    expect(mocks.spriteMock.y).toBeLessThanOrEqual(GameConfig.GROUND_BOTTOM);
  });

  it('does not modify sprite.y when spawned within the ground plane', () => {
    const midY = (GameConfig.GROUND_TOP + GameConfig.GROUND_BOTTOM) / 2;
    const controller = new PlayerController(
      mocks.sceneMock as unknown as Parameters<typeof PlayerController>[0],
      100,
      midY,
    );
    controller.fixedUpdate(GameConfig.FIXED_DELTA_MS);
    expect(mocks.spriteMock.y).toBeGreaterThanOrEqual(GameConfig.GROUND_TOP);
    expect(mocks.spriteMock.y).toBeLessThanOrEqual(GameConfig.GROUND_BOTTOM);
  });
});
