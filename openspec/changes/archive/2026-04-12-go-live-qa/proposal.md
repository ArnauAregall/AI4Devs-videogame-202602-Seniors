## Why

End-to-end playtesting before exercise delivery revealed five gaps that break
core gameplay loops: player movement is blocked by enemy bodies (physics
separation), stage 1 has too few enemies too far from the start (pacing), the
game over screen cannot be navigated with a keyboard (menu UX), the pause and
high scores screens have no back route (navigation), and the countdown timer
running to zero does not end the game (timer expiry). All five gaps are
regressions against design intent and must be resolved before delivery.

## What Changes

- **Physics coexistence**: Disable automatic player-enemy body collision
  response by placing the player and enemies in separate Phaser physics groups
  with `setCollideWorldBounds` remaining active for wall boundaries. All
  knockback and push forces continue to flow through the hitbox/hurtbox
  callback pipeline; no velocity is transferred by body contact. Resolves
  OQ-GOLV-01: group-based filtering is chosen over full body disablement to
  keep wall-boundary enforcement on the existing physics body.

- **Stage pacing**: Adjust stage 1 zone data so the first encounter is within
  2 screen widths, each non-boss zone has ≥ 2 enemies, total non-boss enemy
  count ≥ 8 across ≥ 3 zones, and at least 2 archetypes appear by zone 3.
  Zone gate unlock condition: all enemies in a zone must be defeated (resolves
  OQ-GOLV-03: simpler and consistent with the arcade genre). All configuration
  lives in the stage data file with no hardcoded values in scene logic.

- **Game over keyboard navigation**: Wire up and down arrow keys and Enter on
  the `GameOverOverlay`. Default selection is the first visible option ("Continue"
  if continues remain, otherwise "Quit"). Input listeners attach immediately
  when the overlay becomes visible; they are torn down on scene shutdown to
  prevent listener leaks. Continue grants 1 life (resolves OQ-GOLV-04: standard
  arcade convention).

- **Pause and high scores back navigation**: Add Escape key handling to
  `PauseMenuOverlay` that resumes the scene and restores the timer. Add Escape
  handling to `LeaderboardOverlay` that always navigates to the main menu scene
  (resolves OQ-GOLV-05: direct-to-main-menu avoids a dead-end back-loop).
  Scene transitions must shut down orphaned listeners.

- **Timer expiry game over**: `StageTimer` emits a `timer-expired` event when
  it reaches zero. `GameScene` listens and calls the same `_triggerGameOver()`
  path used for lives-lost. The timer does not decrement while the game is
  paused. Stage-clear condition checked before expiry trigger: if both fire on
  the same update tick, stage clear wins.

## Capabilities

### New Capabilities

- `physics-coexistence`: Group-based collision filter configuration ensuring
  player-enemy body overlap causes no velocity response while preserving
  player-wall and enemy-wall contacts.

### Modified Capabilities

- `stage-data`: Zone definitions now include minimum enemy count, zone gate
  unlock condition (all-defeated), and spawn positions for all stage 1 zones
  meeting the pacing constraints.
- `spawn-zone`: Zone gate logic reads the unlock condition from stage data and
  checks all-defeated state before emitting the unlock event.
- `hud-game-over`: GameOverOverlay gains keyboard cursor navigation (up/down),
  Enter activation, immediate input registration, and listener teardown.
- `hud-pause-menu`: PauseMenuOverlay gains Escape as a resume shortcut and
  ensures the stage timer resumes without drift.
- `hud-leaderboard`: LeaderboardOverlay gains Escape back navigation to the
  main menu regardless of entry path.
- `stage-timer`: Emits `timer-expired` event; does not decrement while paused.
- `game-scene`: Handles `timer-expired` event, resolves expiry-vs-stage-clear
  priority, bootstraps the physics coexistence group filter.

## Impact

- `finalfight-AAA/src/game/scenes/GameScene.ts` — physics group filter setup,
  timer-expired listener, expiry-vs-clear priority guard.
- `finalfight-AAA/src/game/StageTimer.ts` — pause-aware decrement, timer-expired
  event emission.
- `finalfight-AAA/src/hud/GameOverOverlay.ts` — keyboard cursor nav, listener
  lifecycle.
- `finalfight-AAA/src/hud/PauseMenuOverlay.ts` — Escape shortcut, timer resume.
- `finalfight-AAA/src/hud/LeaderboardOverlay.ts` — Escape → main menu.
- `finalfight-AAA/src/stage/SpawnZone.ts` — all-defeated gate check.
- `finalfight-AAA/src/stage/StageData.ts` (or equivalent data file) — updated
  zone configs for stage 1.
- All existing tests that mock `GameScene`, `GameOverOverlay`, `PauseMenuOverlay`,
  `LeaderboardOverlay`, `StageTimer`, or `SpawnZone` may need mock updates.
