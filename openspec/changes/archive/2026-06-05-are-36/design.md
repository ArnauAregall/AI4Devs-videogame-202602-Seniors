## Context

The `MainMenu` scene already implements keyboard navigation (Up/Down/W/S to move cursor, Enter/Space to confirm) and mouse interaction (hover + click). Gamepad support exists in `InputManager` for in-game input but is not wired into the menu. The menu has two items ("Start Game" and "High Scores") with a `_cursor` index selecting between them.

Phaser's gamepad plugin (`scene.input.gamepad`) provides access to connected pads via `pad1`. The d-pad buttons (`pad.up`, `pad.down`) and left stick axis values are already mapped in `InputManager._readGamepad()`.

## Goals / Non-Goals

**Goals:**
- Add gamepad d-pad/stick navigation (up/down) and confirm (A button) to `MainMenu`.
- Debounce gamepad input to prevent rapid cursor scrolling from held buttons.
- Maintain full backward-compatibility with existing keyboard and mouse input.

**Non-Goals:**
- Reusing `InputManager` for menu navigation (it is designed for in-game fixed-tick polling, not UI interaction).
- Adding gamepad support to other overlay scenes (GameOver, PauseOverlay) in this change.
- Rumble/haptic feedback.

## Decisions

1. **Poll gamepad directly in `MainMenu.update()`**: Rather than reusing `InputManager` (which is coupled to the game loop's fixed-timestep accumulator), poll `scene.input.gamepad.pad1` directly in the scene's `update()` method. This keeps menu gamepad logic self-contained and avoids creating a new class.

   *Alternative considered*: Creating a `MenuInputHelper` shared utility — rejected as over-engineering for two menu items; can be introduced later if more menus need it.

2. **Debounce with a cooldown timer**: Track the last navigation timestamp and only allow a new move if at least 200ms have elapsed. Same approach for the confirm button. This prevents the cursor from flickering when a d-pad button is held.

3. **Confirm button = A/Cross (button index 0)**: Consistent with the standard "confirm" button across console platforms and matches what players expect on the first interactive screen.

## Risks / Trade-offs

- [Risk] No gamepad connected at scene start → `pad1` is null. Mitigation: Guard all gamepad reads with `if (!pad)` early return, same pattern as `InputManager._readGamepad()`.
- [Risk] Stick drift triggering navigation. Mitigation: Use same 0.5 dead zone as `InputManager`.
