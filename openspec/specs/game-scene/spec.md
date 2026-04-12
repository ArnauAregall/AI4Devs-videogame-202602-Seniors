# game-scene Specification

## Purpose
TBD - created by archiving change hud. Update Purpose after archive.
## Requirements
### Requirement: GameScene emits HUD sync events
`GameScene` SHALL emit the following events on `this.events` so that `HudScene`
can react without coupling to GameScene internals. Each event name SHALL be a
value in the `GameEvents` enum.

Events and their payloads:
- `PLAYER_HEALTH_CHANGED`: `{ current: number; max: number }`
- `PLAYER_LIVES_CHANGED`: `{ lives: number }`
- `SCORE_CHANGED`: `{ score: number; delta: number }`
- `BOSS_ARRIVED`: `{ maxHealth: number }`
- `BOSS_HEALTH_CHANGED`: `{ current: number; max: number }`
- `COMBO_UPDATED`: `{ count: number; windowActive: boolean }`
- `SPECIAL_COOLDOWN_CHANGED`: `{ fraction: number }` (0 = ready, 1 = just used)
- `TIMER_TICK`: `{ remaining: number }` (integer seconds)
- `TIMER_EXPIRED`: `{}` (no payload — expiry consumed by GameScene, not HUD)
- `STAGE_CLEARED`: `{ score: number; timeBonus: number }`
- `GAME_OVER`: `{ score: number }`
- `PAUSE_TOGGLED`: `{ paused: boolean }`

#### Scenario: PLAYER_HEALTH_CHANGED emitted on player damage
- **WHEN** the player takes damage
- **THEN** `PLAYER_HEALTH_CHANGED` is emitted with updated `current` and `max`

#### Scenario: SCORE_CHANGED emitted on enemy defeat
- **WHEN** an enemy is defeated
- **THEN** `SCORE_CHANGED` is emitted with the enemy's point value as `delta`

#### Scenario: BOSS_ARRIVED emitted when boss spawns
- **WHEN** a boss enemy enters the scene
- **THEN** `BOSS_ARRIVED` is emitted with the boss's `maxHealth`

#### Scenario: PAUSE_TOGGLED emitted on pause input
- **WHEN** the player presses the pause input
- **THEN** `PAUSE_TOGGLED` is emitted with the correct `paused` boolean

#### Scenario: PLAYER_HEALTH_CHANGED emitted on player damage
- **WHEN** the player takes damage
- **THEN** `PLAYER_HEALTH_CHANGED` is emitted with updated `current` and `max`

#### Scenario: SCORE_CHANGED emitted on enemy defeat
- **WHEN** an enemy is defeated
- **THEN** `SCORE_CHANGED` is emitted with the enemy's point value as `delta`

#### Scenario: BOSS_ARRIVED emitted when boss spawns
- **WHEN** a boss enemy enters the scene
- **THEN** `BOSS_ARRIVED` is emitted with the boss's `maxHealth`

#### Scenario: PAUSE_TOGGLED emitted on pause input
- **WHEN** the player presses the pause input
- **THEN** `PAUSE_TOGGLED` is emitted with the correct `paused` boolean

### Requirement: GameScene handles TIMER_EXPIRED to trigger game over
`GameScene` SHALL listen for `GameEvents.TIMER_EXPIRED` on `this.events` and
call `this.triggerGameOver()` if and only if the stage has not already been
cleared (`!this._stageManager?.isCleared`).

This listener SHALL be registered in `GameScene.create()` after the stage
manager is constructed.

The stage-clear condition SHALL take priority over timer expiry: if both occur
on the same fixed-update tick, `StageManager._startStageClear()` sets
`_cleared = true` before emitting `STAGE_CLEARED`, so the `TIMER_EXPIRED`
guard (`!isCleared`) will correctly skip `triggerGameOver()`.

#### Scenario: Timer expiry triggers game over when stage not cleared
- **WHEN** `GameEvents.TIMER_EXPIRED` fires and the stage has not been cleared
- **THEN** `triggerGameOver()` is called exactly once

#### Scenario: Timer expiry does not trigger game over after stage clear
- **WHEN** `GameEvents.TIMER_EXPIRED` fires after `StageManager.isCleared` is true
- **THEN** `triggerGameOver()` is NOT called

#### Scenario: triggerGameOver from timer expiry passes current score
- **WHEN** the game over sequence is triggered by timer expiry
- **THEN** `GameOverScene` is launched with the player's current score unchanged

### Requirement: Physics coexistence comment in GameScene.create
`GameScene.create()` SHALL contain the comment
`/* no player-enemy collider — intentional: FR-GOLV-01 */`
adjacent to the `playerHitboxGroup` initialisation to document that the absence
of a body-separation collider between player and enemies is intentional.

#### Scenario: Comment present in source
- **WHEN** `GameScene.ts` is compiled
- **THEN** the source file contains the string
  `no player-enemy collider — intentional: FR-GOLV-01`

