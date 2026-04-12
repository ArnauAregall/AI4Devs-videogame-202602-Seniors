/**
 * Shared Phaser mock for player subsystem tests.
 *
 * Each test file that imports PlayerController must vi.mock('phaser')
 * before any other import that transitively requires Phaser canvas APIs.
 */
import { vi } from 'vitest';

export function buildPhaserMock() {
  const JustDown = vi.fn((k: { isDown: boolean }) => k.isDown);
  const makeKey  = (isDown = false) => ({ isDown });

  const spriteMock = {
    x: 0, y: 0,
    setFlipX: vi.fn(),
    setPosition: vi.fn(),
    play: vi.fn(),
    anims: {
      setRepeat: vi.fn(),
      currentAnim: null,
    },
    on: vi.fn(),
    off: vi.fn(),
    destroy: vi.fn(),
    scene: null as unknown,
  };

  const keyboardMock = {
    addKey: vi.fn(() => makeKey()),
    on: vi.fn(),
  };

  const gamepadMock = {
    on: vi.fn(),
    pad1: null,
  };

  const animsMock = {
    exists: vi.fn(() => true), // pretend anims already created
    create: vi.fn(),
    generateFrameNumbers: vi.fn(() => []),
  };

  const hitboxItemMock = {
    setPosition: vi.fn(),
    destroy: vi.fn(),
  };

  const sceneMock = {
    input:   { keyboard: keyboardMock, gamepad: gamepadMock },
    physics: {
      add: {
        sprite: vi.fn(() => spriteMock),
        staticGroup: vi.fn(() => ({
          create: vi.fn(() => hitboxItemMock),
        })),
      },
    },
    anims: animsMock,
    registerFixedUpdate:   vi.fn(),
    unregisterFixedUpdate: vi.fn(),
    triggerGameOver:       vi.fn(),
    playerHitboxGroup: {
      create: vi.fn(() => hitboxItemMock),
    },
  };

  // Back-link sprite to scene so _createAnimations() works
  spriteMock.scene = sceneMock;

  const MathMock = {
    Clamp: (v: number, min: number, max: number) => Math.min(Math.max(v, min), max),
  };

  const SceneCtor = class {};

  return {
    default: {
      Scene: SceneCtor,
      Input: {
        Keyboard: {
          KeyCodes: {
            LEFT: 'LEFT', RIGHT: 'RIGHT', UP: 'UP', DOWN: 'DOWN',
            A: 'A', D: 'D', W: 'W', S: 'S',
            Z: 'Z', J: 'J', X: 'X', K: 'K', C: 'C', L: 'L',
            SPACE: 'SPACE', ENTER: 'ENTER',
          },
          JustDown,
        },
        Gamepad: {},
      },
      Math: MathMock,
    },
    Scene: SceneCtor,
    _sceneMock: sceneMock,
    _spriteMock: spriteMock,
  };
}
