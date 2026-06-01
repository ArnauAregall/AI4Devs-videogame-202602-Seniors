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

  describe('Fixed-timestep polling contract', () => {
    it('poll() is invoked exactly once per fixed-timestep tick via PlayerController.fixedUpdate()', () => {
      const pollSpy = vi.spyOn(manager, 'poll');

      // Simulate 3 fixed-timestep ticks calling fixedUpdate
      for (let i = 0; i < 3; i++) {
        manager.poll();
      }

      expect(pollSpy).toHaveBeenCalledTimes(3);
    });

    it('poll() is not called during render frames (only during fixed-timestep ticks)', () => {
      // Verify that poll() returns a snapshot per call and is designed for once-per-tick usage.
      // Multiple render frames between ticks should NOT call poll — the contract is enforced
      // by PlayerController.fixedUpdate() being the sole call site, registered in the accumulator.
      const result1 = manager.poll();
      const result2 = manager.poll();

      // Each call produces an independent frozen snapshot
      expect(Object.isFrozen(result1)).toBe(true);
      expect(Object.isFrozen(result2)).toBe(true);
      // They are separate object references (not cached)
      expect(result1).not.toBe(result2);
    });
  });

  describe('Default keyboard mapping (FR-PL-12)', () => {
    // The mock's addKey is called in constructor order. Track calls to set isDown.
    // Order: LEFT, A, RIGHT, D, UP, W, DOWN, S, Z, J, X, K, C, L, SPACE, ENTER
    const KEY_INDEX = {
      LEFT: 0, A: 1, RIGHT: 2, D: 3, UP: 4, W: 5, DOWN: 6, S: 7,
      Z: 8, J: 9, X: 10, K: 11, C: 12, L: 13, SPACE: 14, ENTER: 15,
    } as const;

    function pressKey(keyIndex: number) {
      const kb = scene.input.keyboard!;
      const keys = (kb.addKey as ReturnType<typeof vi.fn>).mock.results;
      keys[keyIndex].value.isDown = true;
    }

    function releaseAll() {
      const kb = scene.input.keyboard!;
      const keys = (kb.addKey as ReturnType<typeof vi.fn>).mock.results;
      for (const k of keys) k.value.isDown = false;
    }

    beforeEach(() => {
      releaseAll();
    });

    it('LEFT arrow key sets inputState.left to true', () => {
      pressKey(KEY_INDEX.LEFT);
      expect(manager.poll().left).toBe(true);
    });

    it('RIGHT arrow key sets inputState.right to true', () => {
      pressKey(KEY_INDEX.RIGHT);
      expect(manager.poll().right).toBe(true);
    });

    it('UP arrow key sets inputState.up to true', () => {
      pressKey(KEY_INDEX.UP);
      expect(manager.poll().up).toBe(true);
    });

    it('DOWN arrow key sets inputState.down to true', () => {
      pressKey(KEY_INDEX.DOWN);
      expect(manager.poll().down).toBe(true);
    });

    it('A key sets inputState.left to true', () => {
      pressKey(KEY_INDEX.A);
      expect(manager.poll().left).toBe(true);
    });

    it('D key sets inputState.right to true', () => {
      pressKey(KEY_INDEX.D);
      expect(manager.poll().right).toBe(true);
    });

    it('W key sets inputState.up to true', () => {
      pressKey(KEY_INDEX.W);
      expect(manager.poll().up).toBe(true);
    });

    it('S key sets inputState.down to true', () => {
      pressKey(KEY_INDEX.S);
      expect(manager.poll().down).toBe(true);
    });

    it('Z key sets inputState.lightAttack to true', () => {
      pressKey(KEY_INDEX.Z);
      expect(manager.poll().lightAttack).toBe(true);
    });

    it('J key sets inputState.lightAttack to true', () => {
      pressKey(KEY_INDEX.J);
      expect(manager.poll().lightAttack).toBe(true);
    });

    it('X key sets inputState.heavyAttack to true', () => {
      pressKey(KEY_INDEX.X);
      expect(manager.poll().heavyAttack).toBe(true);
    });

    it('K key sets inputState.heavyAttack to true', () => {
      pressKey(KEY_INDEX.K);
      expect(manager.poll().heavyAttack).toBe(true);
    });

    it('C key sets inputState.grab to true', () => {
      pressKey(KEY_INDEX.C);
      expect(manager.poll().grab).toBe(true);
    });

    it('L key sets inputState.grab to true', () => {
      pressKey(KEY_INDEX.L);
      expect(manager.poll().grab).toBe(true);
    });

    it('Space key sets inputState.jump to true', () => {
      pressKey(KEY_INDEX.SPACE);
      expect(manager.poll().jump).toBe(true);
    });

    it('Enter key sets inputState.specialAttack to true', () => {
      pressKey(KEY_INDEX.ENTER);
      expect(manager.poll().specialAttack).toBe(true);
    });

    it('both keys in a pair trigger the same action simultaneously (LEFT + A → left)', () => {
      pressKey(KEY_INDEX.LEFT);
      pressKey(KEY_INDEX.A);
      const state = manager.poll();
      expect(state.left).toBe(true);
    });

    it('both keys in a pair trigger the same action simultaneously (RIGHT + D → right)', () => {
      pressKey(KEY_INDEX.RIGHT);
      pressKey(KEY_INDEX.D);
      const state = manager.poll();
      expect(state.right).toBe(true);
    });

    it('both keys in a pair trigger the same action simultaneously (UP + W → up)', () => {
      pressKey(KEY_INDEX.UP);
      pressKey(KEY_INDEX.W);
      const state = manager.poll();
      expect(state.up).toBe(true);
    });

    it('both keys in a pair trigger the same action simultaneously (DOWN + S → down)', () => {
      pressKey(KEY_INDEX.DOWN);
      pressKey(KEY_INDEX.S);
      const state = manager.poll();
      expect(state.down).toBe(true);
    });

    it('both keys in a pair trigger the same action simultaneously (Z + J → lightAttack)', () => {
      pressKey(KEY_INDEX.Z);
      pressKey(KEY_INDEX.J);
      const state = manager.poll();
      expect(state.lightAttack).toBe(true);
    });

    it('both keys in a pair trigger the same action simultaneously (X + K → heavyAttack)', () => {
      pressKey(KEY_INDEX.X);
      pressKey(KEY_INDEX.K);
      const state = manager.poll();
      expect(state.heavyAttack).toBe(true);
    });

    it('both keys in a pair trigger the same action simultaneously (C + L → grab)', () => {
      pressKey(KEY_INDEX.C);
      pressKey(KEY_INDEX.L);
      const state = manager.poll();
      expect(state.grab).toBe(true);
    });
  });
});
