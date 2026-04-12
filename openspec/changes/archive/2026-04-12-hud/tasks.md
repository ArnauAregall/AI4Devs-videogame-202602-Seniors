# Tasks — hud

## 1. HudConfig constants

- [x] 1.1 Create `src/hud/HudConfig.ts` with all named constants: health colours and thresholds, timer warning, boss bar position, score/lives positions, font sizes, combo minimum, max continues, leaderboard constants, score point values per enemy archetype

## 2. GameScene HUD events

- [x] 2.1 Add HUD event names to `GameEvents` enum in `src/game/GameEvents.ts` (PLAYER_HEALTH_CHANGED, PLAYER_LIVES_CHANGED, SCORE_CHANGED, BOSS_ARRIVED, BOSS_HEALTH_CHANGED, COMBO_UPDATED, SPECIAL_COOLDOWN_CHANGED, TIMER_TICK, STAGE_CLEARED, GAME_OVER, PAUSE_TOGGLED)
- [x] 2.2 Emit `PLAYER_HEALTH_CHANGED` from GameScene when player takes damage
- [x] 2.3 Emit `PLAYER_LIVES_CHANGED` from GameScene when player loses a life
- [x] 2.4 Emit `SCORE_CHANGED` from GameScene when an enemy is defeated (use per-archetype point constants)
- [x] 2.5 Emit `BOSS_ARRIVED` from GameScene when boss spawns
- [x] 2.6 Emit `BOSS_HEALTH_CHANGED` from GameScene when boss takes damage
- [x] 2.7 Emit `COMBO_UPDATED` from GameScene on combo changes
- [x] 2.8 Emit `SPECIAL_COOLDOWN_CHANGED` from GameScene when special attack cooldown changes
- [x] 2.9 Emit `TIMER_TICK` from GameScene each second of the countdown
- [x] 2.10 Emit `STAGE_CLEARED` from GameScene when stage clear condition fires
- [x] 2.11 Emit `GAME_OVER` from GameScene when lives reach zero
- [x] 2.12 Emit `PAUSE_TOGGLED` from GameScene on pause input

## 3. HUD component classes

- [x] 3.1 Create `src/hud/HealthBar.ts` — renders player health bar with colour thresholds from HudConfig
- [x] 3.2 Create `src/hud/BossHealthBar.ts` — renders boss health bar, hidden by default, shown/hidden on boss events
- [x] 3.3 Create `src/hud/ScoreDisplay.ts` — right-aligned score text updated on SCORE_CHANGED
- [x] 3.4 Create `src/hud/LivesDisplay.ts` — lives numeric text with label prefix updated on PLAYER_LIVES_CHANGED
- [x] 3.5 Create `src/hud/ComboCounter.ts` — visible at ≥ HUD_COMBO_MIN_COUNT, hidden on window expiry
- [x] 3.6 Create `src/hud/TimerDisplay.ts` — countdown from 180 s, warning colour at ≤ HUD_TIMER_WARNING_SECONDS
- [x] 3.7 Create `src/hud/SpecialCooldownDisplay.ts` — draining pip bar showing cooldown fraction

## 4. Overlay components

- [x] 4.1 Create `src/hud/GameOverOverlay.ts` — "GAME OVER" text, final score, Continue option (hidden when exhausted), Quit to Main Menu option
- [x] 4.2 Create `src/hud/StageClearOverlay.ts` — "STAGE CLEAR" text, stage score, optional time bonus display
- [x] 4.3 Create `src/hud/PauseMenuOverlay.ts` — "PAUSED" text, Resume/View Controls/Quit options, cursor index, keyboard+gamepad navigation

## 5. Leaderboard

- [x] 5.1 Create `src/hud/LeaderboardStore.ts` — read/write top-10 array to localStorage with try/catch in-memory fallback
- [x] 5.2 Create `src/hud/NameEntryPrompt.ts` — text input prompt capped at HUD_LEADERBOARD_NAME_MAX_LENGTH, triggered when score qualifies
- [x] 5.3 Create `src/hud/LeaderboardOverlay.ts` — renders top-10 sorted entries; accessible from Game Over and Main Menu

## 6. HudScene

- [x] 6.1 Create `src/hud/HudScene.ts` — Phaser Scene key `'HudScene'`; fixed camera; instantiates all components; registers all GameScene event listeners; reads initial state snapshot in create()
- [x] 6.2 Register `HudScene` in the Phaser game config scene list
- [x] 6.3 Launch `HudScene` from `GameScene.create()` via `this.scene.launch('HudScene')`
- [x] 6.4 Add Main Menu "High Scores" option that opens `LeaderboardOverlay`

## 7. Integration wiring

- [x] 7.1 Wire `STAGE_CLEARED` listener in HudScene to show `StageClearOverlay` and pause GameScene
- [x] 7.2 Wire `GAME_OVER` listener in HudScene to show `GameOverOverlay`, pause GameScene, and check leaderboard qualification
- [x] 7.3 Wire `PAUSE_TOGGLED` listener in HudScene to show/hide `PauseMenuOverlay` and pause/resume GameScene

## 8. Tests

- [x] 8.1 Create `src/__tests__/HudConfig.test.ts` — verify all required constants are exported and are of correct type
- [x] 8.2 Create `src/__tests__/HealthBar.test.ts` — fill proportion, colour thresholds (green/yellow/red), zero health, full health
- [x] 8.3 Create `src/__tests__/BossHealthBar.test.ts` — hidden by default, shown on BOSS_ARRIVED, fill update, hidden on defeat
- [x] 8.4 Create `src/__tests__/ScoreDisplay.test.ts` — initial zero, update on SCORE_CHANGED, right-alignment
- [x] 8.5 Create `src/__tests__/LivesDisplay.test.ts` — initial value, update on PLAYER_LIVES_CHANGED, label present
- [x] 8.6 Create `src/__tests__/ComboCounter.test.ts` — hidden below minimum, visible at ≥ 2, hidden on expiry, shows count only
- [x] 8.7 Create `src/__tests__/TimerDisplay.test.ts` — initial 180, TIMER_TICK updates, warning colour at ≤ 30, normal colour above 30
- [x] 8.8 Create `src/__tests__/SpecialCooldownDisplay.test.ts` — full at fraction 0, empty at fraction 1, 50% at fraction 0.5, always visible
- [x] 8.9 Create `src/__tests__/GameOverOverlay.test.ts` — text content, Continue visibility by continue count, Quit option always present
- [x] 8.10 Create `src/__tests__/StageClearOverlay.test.ts` — text content, time bonus shown/hidden
- [x] 8.11 Create `src/__tests__/PauseMenuOverlay.test.ts` — all three options present, keyboard cursor navigation, Enter confirms
- [x] 8.12 Create `src/__tests__/LeaderboardStore.test.ts` — save and retrieve, top-10 cap, sorted order, localStorage fallback
- [x] 8.13 Create `src/__tests__/LeaderboardOverlay.test.ts` — sorted display, empty state, name prompt triggered/skipped, name length cap
