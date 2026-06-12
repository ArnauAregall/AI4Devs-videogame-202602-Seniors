## Context

`MainMenuScene` already exists with keyboard (arrow keys, WASD, Enter, Space) and mouse/pointer navigation. The scene displays "FINAL FIGHT" title and two options: "START GAME" and "HIGH SCORES". It transitions to `GameScene` or `LeaderboardScene` respectively.

Gamepad support is missing. The game uses Phaser 3's built-in gamepad API (`this.input.gamepad`).

## Goals / Non-Goals

**Goals:**
- Add gamepad D-pad up/down navigation to cycle menu options.
- Add gamepad confirm button (button index 0 — A on Xbox, Cross on PlayStation) to activate the selected option.
- Debounce gamepad input to prevent rapid-fire cycling from held buttons.

**Non-Goals:**
- Analog stick navigation (D-pad only for menus).
- Gamepad vibration or haptic feedback.
- Remappable gamepad buttons.

## Decisions

1. **Poll gamepad in `update()` rather than event-based** — Phaser's gamepad events require the pad to be connected before the scene starts. Polling in `update()` is more reliable for hot-plugged controllers. The menu has only 2 items so per-frame polling is negligible cost.

2. **Debounce via a cooldown tick counter** — Set a `_padCooldown` counter that decrements each frame. Only process D-pad/button input when cooldown is 0. Reset to ~12 frames (~200ms at 60fps) on each accepted input. This prevents rapid cycling.

3. **Button 0 for confirm** — Standard mapping: button index 0 is the "south" face button (A/Cross). This matches the convention used in `PauseOverlay` and other scenes.

## Risks / Trade-offs

- [Risk] Gamepad not detected if connected after scene starts → Mitigation: Polling `this.input.gamepad?.getPad(0)` each frame handles hot-plug naturally.
- [Trade-off] No analog stick support simplifies implementation but may surprise some players → Acceptable for a retro beat-'em-up menu.
