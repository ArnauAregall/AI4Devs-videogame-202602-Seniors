## Why

The Main Menu scene currently lacks gamepad navigation support. Players using a gamepad cannot cycle through or select menu options. The scene needs full gamepad support alongside the existing keyboard and mouse input to match the game's beat-'em-up genre expectations.

## What Changes

- Add gamepad polling in `MainMenuScene` to detect D-pad up/down for cycling menu options and a confirm button (A/Cross) for selection.
- Ensure the scene activates correctly after `PreloadScene` finishes loading (already wired, but formalised here).
- Transitions to `GameScene` (Start Game) and `LeaderboardScene` (High Scores) remain unchanged.

## Capabilities

### New Capabilities

- `main-menu-gamepad`: Gamepad navigation support for the Main Menu scene — D-pad up/down cycles options, confirm button activates the selected option.

### Modified Capabilities

- `main-menu-scene`: Add gamepad input as an accepted navigation method alongside keyboard and mouse.

## Impact

- `finalfight-AAA/src/game/scenes/MainMenu.ts` — add gamepad polling logic in `update()`.
- No new dependencies or breaking changes.
