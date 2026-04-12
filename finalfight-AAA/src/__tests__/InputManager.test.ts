import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('phaser', () => {
  const makeKey = (isDown = false) => ({ isDown });

  const JustDown = vi.fn((k: { isDown: boolean }) => k.isDown);

  const keyboard = {
    addKey: vi.fn(() => makeKey()),
    on: vi.fn(),
  };

  const gamepad = {
    on: vi.fn(),
    pad1: null as null | Record<string, unknown>,
  };

  const input = { keyboard, gamepad };

  const SceneMock = class {
    input = input;
    physics = { add: { sprite: vi.fn(), staticGroup: vi.fn(() => ({ create: vi.fn() })) } };
    anims   = { exists: vi.fn(() => false), create: vi.fn(), generateFrameNumbers: vi.fn(() => []) };
    registerFixedUpdate = vi.fn();
    unregisterFixedUpdate = vi.fn();
    triggerGameOver = vi.fn();
    playerHitboxGroup = { create: vi.fn() };
  };

  return {
    default: {
      Scene: SceneMock,
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
      Math: { Clamp: (v: number, min: number, max: number) => Math.min(Math.max(v, min), max) },
    },
    Scene: SceneMock,
  };
});

import { InputManager } from '../input/InputManager';
import { EMPTY_INPUT } from '../input/InputState';
import Phaser from 'phaser';

function makeScene() {
  // @ts-ignore
  return new (Phaser.Scene)() as InstanceType<typeof Phaser.Scene>;
}

describe('InputManager', () => {
  let scene: ReturnType<typeof makeScene>;
  let manager: InputManager;

  beforeEach(() => {
    vi.clearAllMocks();
    scene = makeScene();
    manager = new InputManager(scene as unknown as Phaser.Scene);
  });

  it('returns all-false snapshot when no keys are pressed', () => {
    const state = manager.poll();
    expect(state).toMatchObject(EMPTY_INPUT);
  });

  it('snapshot has all required InputState fields', () => {
    const state = manager.poll();
    const required: (keyof typeof EMPTY_INPUT)[] = [
      'left', 'right', 'up', 'down',
      'jump', 'lightAttack', 'heavyAttack', 'grab', 'specialAttack',
    ];
    for (const field of required) {
      expect(state).toHaveProperty(field);
      expect(typeof state[field]).toBe('boolean');
    }
  });

  it('returns a frozen (read-only) object', () => {
    const state = manager.poll();
    expect(Object.isFrozen(state)).toBe(true);
  });

  it('does not throw when gamepad is null', () => {
    (scene.input as unknown as { gamepad: null }).gamepad = null;
    expect(() => manager.poll()).not.toThrow();
  });

  it('does not throw when gamepad.on is unavailable', () => {
    // Simulate environment without gamepad plugin
    (scene.input as unknown as { gamepad: null }).gamepad = null;
    expect(() => new InputManager(scene as unknown as Phaser.Scene)).not.toThrow();
  });
});
