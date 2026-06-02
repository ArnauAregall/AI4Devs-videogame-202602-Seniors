import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GameConfig } from '../config/GameConfig';
import { PlayerState } from '../player/PlayerState';

const mocks = vi.hoisted(() => {
  const spriteMock = {
    x: 0, y: 0,
    setFlipX: vi.fn(),
    setDepth: vi.fn(),
    play: vi.fn(),
    setVelocityX: vi.fn(),
    setVelocityY: vi.fn(),
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

const NO_INPUT = { left: false, right: false, up: false, down: false, jump: false, lightAttack: false, heavyAttack: false, grab: false, specialAttack: false };

type ControllerInternals = {
  _stateMachine: { current: PlayerState; transition: (s: PlayerState) => boolean };
  _processInput: (input: typeof NO_INPUT) => void;
  _applyMovement: (input: typeof NO_INPUT) => void;
  _baseY: number;
};

describe('PlayerIdleWalkAnimation', () => {
  let controller: PlayerController;

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.spriteMock.x = 0;
    mocks.spriteMock.y = 0;
    (mocks.sceneMock.physics.add.sprite as ReturnType<typeof vi.fn>).mockReturnValue(mocks.spriteMock);
    controller = new PlayerController(mocks.sceneMock as unknown as Parameters<typeof PlayerController>[0], 100, 150);
  });

  it('player in Walk state with only up input at GROUND_TOP transitions to Idle', () => {
    const internals = controller as unknown as ControllerInternals;
    internals._baseY = GameConfig.GROUND_TOP;
    internals._stateMachine.current = PlayerState.Walk;

    internals._applyMovement({ ...NO_INPUT, up: true });

    expect(internals._stateMachine.current).toBe(PlayerState.Idle);
  });

  it('player in Walk state with only down input at GROUND_BOTTOM transitions to Idle', () => {
    const internals = controller as unknown as ControllerInternals;
    internals._baseY = GameConfig.GROUND_BOTTOM;
    internals._stateMachine.current = PlayerState.Walk;

    internals._applyMovement({ ...NO_INPUT, down: true });

    expect(internals._stateMachine.current).toBe(PlayerState.Idle);
  });

  it('player in Walk state with up+right at GROUND_TOP remains in Walk (horizontal still effective)', () => {
    const internals = controller as unknown as ControllerInternals;
    internals._baseY = GameConfig.GROUND_TOP;
    internals._stateMachine.current = PlayerState.Walk;

    internals._applyMovement({ ...NO_INPUT, up: true, right: true });

    expect(internals._stateMachine.current).toBe(PlayerState.Walk);
  });

  it('releasing all directional keys from Walk transitions to Idle on the same tick', () => {
    const internals = controller as unknown as ControllerInternals;
    internals._stateMachine.current = PlayerState.Walk;

    internals._processInput({ ...NO_INPUT });

    expect(internals._stateMachine.current).toBe(PlayerState.Idle);
  });

  it('Idle animation loops continuously when state is Idle (no interruption across multiple ticks)', () => {
    const internals = controller as unknown as ControllerInternals;
    // Controller starts in Idle — sprite.play should have been called with idle key
    mocks.spriteMock.play.mockClear();

    // Simulate multiple ticks with no input
    for (let i = 0; i < 5; i++) {
      internals._processInput({ ...NO_INPUT });
      internals._applyMovement({ ...NO_INPUT });
    }

    // State remains Idle
    expect(internals._stateMachine.current).toBe(PlayerState.Idle);
    // play() should NOT have been called again (no re-trigger / interruption)
    expect(mocks.spriteMock.play).not.toHaveBeenCalled();
  });
});
