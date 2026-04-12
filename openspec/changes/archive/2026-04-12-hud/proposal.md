## Why

The game currently has no visual feedback layer for the player. Without a HUD, the player cannot see their health, score, lives, boss status, or combo count — core information required to make gameplay decisions. The HUD also provides the game-over, stage-clear, and pause overlays needed to complete the gameplay loop.

## What Changes

- New `HudScene` Phaser Scene added as a permanent overlay scene (always-on-top, not camera-scrolling).
- Player health bar drawn with Phaser Graphics, colour-coded by threshold constants.
- Lives counter rendered as numeric text with a player icon sprite.
- Score display rendered as right-aligned text, updated on `enemyDefeated` events.
- Boss health bar shown/hidden based on `bossArrived` / `enemyDefeated` (boss) events.
- Combo counter shown when combo ≥ 2, hidden on combo-window expiry.
- Special attack cooldown indicator displays remaining cooldown as a draining pip bar.
- Countdown timer counts down from 180 s, turns warning-colour at ≤ 30 s.
- Game Over screen: "GAME OVER", final score, Continue (if continues remain), Quit to Main Menu.
- Stage Clear screen: "STAGE CLEAR", stage score, time bonus if timer was active.
- Pause Menu: "PAUSED", Resume / View Controls / Quit to Main Menu; keyboard + gamepad nav.
- High Score Leaderboard: top-10 list (name + score), persisted in `localStorage`; accessible from Main Menu and Game Over screen.
- Name-entry prompt triggered when player earns a top-10 score.
- `game-scene` modified: emits `hudSync` event payloads so `HudScene` stays decoupled.

## Capabilities

### New Capabilities

- `hud-scene`: Phaser Scene that acts as the fixed overlay; owns layout, all sub-components, and event wiring.
- `hud-health-bar`: Player health bar with colour thresholds (green/yellow/red).
- `hud-boss-health-bar`: Boss health bar, shown on `bossArrived`, hidden on boss defeat.
- `hud-score`: Right-aligned score text; increments per `enemyDefeated` payload point value.
- `hud-lives`: Lives counter (numeric + icon).
- `hud-combo`: Combo counter shown at ≥ 2 hits, hidden on expiry.
- `hud-timer`: Countdown timer 180 s → 0, warning colour at ≤ 30 s.
- `hud-special-cooldown`: Special-attack cooldown pip bar.
- `hud-game-over`: Game Over overlay with continue logic (max 3 continues).
- `hud-stage-clear`: Stage Clear overlay with time bonus.
- `hud-pause-menu`: Pause overlay with keyboard + gamepad navigation.
- `hud-leaderboard`: Top-10 leaderboard persisted in `localStorage`; name-entry prompt when score qualifies.
- `hud-config`: Named constants for all colour values, thresholds, font sizes, and layout positions.

### Modified Capabilities

- `game-scene`: Emit `hudSync` event payloads (playerHealthChanged, playerLivesChanged, scoreChanged, bossArrived, bossHealthChanged, comboUpdated, specialCooldownChanged, timerTick, stageCleared, gameOver, pauseToggled) so HudScene remains decoupled from GameScene internals.

## Impact

- New files: `finalfight-AAA/src/hud/*.ts` (HudScene + component classes).
- Modified: `finalfight-AAA/src/game/scenes/GameScene.ts` — emit HUD sync events.
- No changes to player, enemy-ai, or combat-system logic; events are read-only taps.
- `localStorage` key `finalfight_leaderboard` introduced; no server dependency.
- All HUD rendering on Phaser Scene with depth 9999 (above all game layers).
