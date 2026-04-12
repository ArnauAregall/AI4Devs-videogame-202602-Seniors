/**
 * Normalised snapshot of all player input for a single fixed tick.
 * All fields are booleans; the snapshot is read-only after creation.
 *
 * @spec input-manager – Requirement: InputManager polls keyboard every fixed tick
 * @implements FR-PL-12, FR-PL-13
 */
export interface InputState {
  readonly left: boolean;
  readonly right: boolean;
  readonly up: boolean;
  readonly down: boolean;
  readonly jump: boolean;
  readonly lightAttack: boolean;
  readonly heavyAttack: boolean;
  readonly grab: boolean;
  readonly specialAttack: boolean;
}

/** An all-false InputState used as a safe default / fallback. */
export const EMPTY_INPUT: Readonly<InputState> = Object.freeze({
  left: false,
  right: false,
  up: false,
  down: false,
  jump: false,
  lightAttack: false,
  heavyAttack: false,
  grab: false,
  specialAttack: false,
});
