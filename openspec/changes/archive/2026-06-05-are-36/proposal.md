## Why

The Main Menu scene currently only supports keyboard and mouse input for navigating menu options. The acceptance criteria require full gamepad support (d-pad/stick navigation + confirm button) so the game is playable with a controller from the very first interactive screen.

## What Changes

- Add gamepad polling to `MainMenu.create()` so connected gamepads can navigate menu options with d-pad/stick and confirm with the standard A/Cross button.
- Ensure the scene correctly handles gamepad connect/disconnect without breaking keyboard navigation.
- Validate that after Preload completes, MainMenuScene becomes active showing the game title and both "Start Game" and "High Scores" options.
- "Start Game" transitions to `GameScene`; "High Scores" transitions to `LeaderboardScene`.

## Capabilities

### New Capabilities

### Modified Capabilities

- `main-menu-scene`: Add gamepad navigation requirement (d-pad/stick to move cursor, confirm button to activate selection).

## Impact

- `finalfight-AAA/src/game/scenes/MainMenu.ts` — add gamepad polling in `update()` for navigation and confirmation.
- Test coverage for gamepad input in MainMenu.
