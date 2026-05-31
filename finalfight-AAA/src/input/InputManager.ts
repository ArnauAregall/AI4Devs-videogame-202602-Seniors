import Phaser from 'phaser';
import { type InputState, EMPTY_INPUT } from './InputState';

/**
 * Polls keyboard and gamepad input every fixed tick and returns a
 * normalised, frozen {@link InputState} snapshot. Keyboard and gamepad
 * inputs are OR-combined so either source can drive the character.
 *
 * Gamepad support degrades gracefully: if `input.gamepad` is unavailable
 * or no pad is connected, the snapshot falls back to keyboard-only.
 *
 * @spec input-manager
 * @implements FR-PL-12, FR-PL-13, NFR-PL-01, NFR-PL-03, NFR-PL-04
 */
export class InputManager {
  private readonly _scene: Phaser.Scene;

  // ── Keyboard keys ────────────────────────────────────────────────────────
  private readonly _left1: Phaser.Input.Keyboard.Key;
  private readonly _left2: Phaser.Input.Keyboard.Key;
  private readonly _right1: Phaser.Input.Keyboard.Key;
  private readonly _right2: Phaser.Input.Keyboard.Key;
  private readonly _up1: Phaser.Input.Keyboard.Key;
  private readonly _up2: Phaser.Input.Keyboard.Key;
  private readonly _down1: Phaser.Input.Keyboard.Key;
  private readonly _down2: Phaser.Input.Keyboard.Key;
  private readonly _jump: Phaser.Input.Keyboard.Key;
  private readonly _lightAttack1: Phaser.Input.Keyboard.Key;
  private readonly _lightAttack2: Phaser.Input.Keyboard.Key;
  private readonly _heavyAttack1: Phaser.Input.Keyboard.Key;
  private readonly _heavyAttack2: Phaser.Input.Keyboard.Key;
  private readonly _grab1: Phaser.Input.Keyboard.Key;
  private readonly _grab2: Phaser.Input.Keyboard.Key;
  private readonly _specialAttack: Phaser.Input.Keyboard.Key;

  constructor(scene: Phaser.Scene) {
    this._scene = scene;

    const kb = scene.input.keyboard!;

    // ── Movement: arrows OR WASD ─────────────────────────────────────────
    this._left1  = kb.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
    this._left2  = kb.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this._right1 = kb.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
    this._right2 = kb.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    this._up1    = kb.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
    this._up2    = kb.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this._down1  = kb.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
    this._down2  = kb.addKey(Phaser.Input.Keyboard.KeyCodes.S);

    // ── Attacks: primary OR alternate ────────────────────────────────────
    this._lightAttack1 = kb.addKey(Phaser.Input.Keyboard.KeyCodes.Z);
    this._lightAttack2 = kb.addKey(Phaser.Input.Keyboard.KeyCodes.J);
    this._heavyAttack1 = kb.addKey(Phaser.Input.Keyboard.KeyCodes.X);
    this._heavyAttack2 = kb.addKey(Phaser.Input.Keyboard.KeyCodes.K);
    this._grab1        = kb.addKey(Phaser.Input.Keyboard.KeyCodes.C);
    this._grab2        = kb.addKey(Phaser.Input.Keyboard.KeyCodes.L);

    // ── Jump: Space | Special: Enter ────────────────────────────────────
    this._jump          = kb.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this._specialAttack = kb.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);

    // ── Gamepad connect / disconnect ─────────────────────────────────────
    try {
      scene.input.gamepad?.on('connected', (pad: Phaser.Input.Gamepad.Gamepad) => {
        console.info(`[InputManager] Gamepad connected: ${pad.id}`);
      });
      scene.input.gamepad?.on('disconnected', (pad: Phaser.Input.Gamepad.Gamepad) => {
        console.warn(`[InputManager] Gamepad disconnected: ${pad.id}. Falling back to keyboard.`);
      });
    } catch {
      // Gamepad plugin unavailable in headless / test environments — safe to ignore.
    }
  }

  /**
   * Reads the current keyboard and gamepad state and returns a frozen
   * {@link InputState} snapshot.
   *
   * @remarks Must be invoked exactly once per fixed-timestep tick inside the
   * accumulator loop. Do not call per render frame — doing so violates the
   * determinism contract (input state must reflect exactly one poll per tick).
   *
   * @spec input-manager – Requirement: InputManager polls keyboard every fixed tick
   * @implements NFR-PL-03
   */
  poll(): Readonly<InputState> {
    const kb = this._readKeyboard();
    const gp = this._readGamepad();

    // OR-combine keyboard and gamepad
    return Object.freeze({
      left:         kb.left         || gp.left,
      right:        kb.right        || gp.right,
      up:           kb.up           || gp.up,
      down:         kb.down         || gp.down,
      jump:         kb.jump         || gp.jump,
      lightAttack:  kb.lightAttack  || gp.lightAttack,
      heavyAttack:  kb.heavyAttack  || gp.heavyAttack,
      grab:         kb.grab         || gp.grab,
      specialAttack: kb.specialAttack || gp.specialAttack,
    } satisfies InputState);
  }

  // ── Private helpers ───────────────────────────────────────────────────

  private _readKeyboard(): InputState {
    const d = Phaser.Input.Keyboard.JustDown;
    const isDown = (k: Phaser.Input.Keyboard.Key) => k.isDown;
    return {
      left:         isDown(this._left1)  || isDown(this._left2),
      right:        isDown(this._right1) || isDown(this._right2),
      up:           isDown(this._up1)    || isDown(this._up2),
      down:         isDown(this._down1)  || isDown(this._down2),
      jump:         d(this._jump),
      lightAttack:  isDown(this._lightAttack1) || isDown(this._lightAttack2),
      heavyAttack:  isDown(this._heavyAttack1) || isDown(this._heavyAttack2),
      grab:         isDown(this._grab1) || isDown(this._grab2),
      specialAttack: d(this._specialAttack),
    };
  }

  /**
   * Reads gamepad index 0 (pad1). Returns {@link EMPTY_INPUT} if no pad
   * is connected or the gamepad plugin is unavailable.
   *
   * Button mapping:
   * - A/Cross (0)   → jump
   * - X/Square (2)  → lightAttack
   * - Y/Triangle (3)→ heavyAttack
   * - B/Circle (1)  → grab
   * - LB/L1 (4)     → specialAttack
   * - Left stick / d-pad → movement
   *
   * @spec input-manager – Requirement: Gamepad input maps to the same InputState fields
   * @implements FR-PL-13
   */
  private _readGamepad(): InputState {
    try {
      const pad = this._scene.input.gamepad?.pad1;
      if (!pad) return EMPTY_INPUT;

      const DEAD_ZONE = 0.5;
      const axisX = pad.axes.length > 0 ? pad.axes[0].getValue() : 0;
      const axisY = pad.axes.length > 1 ? pad.axes[1].getValue() : 0;

      return {
        left:         pad.left || axisX < -DEAD_ZONE,
        right:        pad.right || axisX > DEAD_ZONE,
        up:           pad.up || axisY < -DEAD_ZONE,
        down:         pad.down || axisY > DEAD_ZONE,
        jump:         pad.A,
        lightAttack:  pad.X,
        heavyAttack:  pad.Y,
        grab:         pad.B,
        specialAttack: pad.L1,
      };
    } catch {
      return EMPTY_INPUT;
    }
  }
}
