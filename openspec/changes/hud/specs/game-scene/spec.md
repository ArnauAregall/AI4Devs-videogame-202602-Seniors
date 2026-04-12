## MODIFIED Requirements

### Requirement: GameScene emits HUD sync events
`GameScene` SHALL emit the following events on `this.events` so that `HudScene` can react without coupling to GameScene internals. Each event name SHALL be a value in the `GameEvents` enum.

Events and their payloads:
- `PLAYER_HEALTH_CHANGED`: `{ current: number; max: number }`
- `PLAYER_LIVES_CHANGED`: `{ lives: number }`
- `SCORE_CHANGED`: `{ score: number; delta: number }`
- `BOSS_ARRIVED`: `{ maxHealth: number }`
- `BOSS_HEALTH_CHANGED`: `{ current: number; max: number }`
- `COMBO_UPDATED`: `{ count: number; windowActive: boolean }`
- `SPECIAL_COOLDOWN_CHANGED`: `{ fraction: number }` (0 = ready, 1 = just used)
- `TIMER_TICK`: `{ remaining: number }` (integer seconds)
- `STAGE_CLEARED`: `{ score: number; timeBonus: number }`
- `GAME_OVER`: `{ score: number }`
- `PAUSE_TOGGLED`: `{ paused: boolean }`

#### Scenario: PLAYER_HEALTH_CHANGED emitted on player damage
- **WHEN** the player takes damage
- **THEN** `PLAYER_HEALTH_CHANGED` is emitted with updated `current` and `max` values

#### Scenario: SCORE_CHANGED emitted on enemy defeat
- **WHEN** an enemy is defeated
- **THEN** `SCORE_CHANGED` is emitted with the enemy's point value as `delta`

#### Scenario: BOSS_ARRIVED emitted when boss spawns
- **WHEN** a boss enemy enters the scene
- **THEN** `BOSS_ARRIVED` is emitted with the boss's `maxHealth`

#### Scenario: PAUSE_TOGGLED emitted on pause input
- **WHEN** the player presses the pause input
- **THEN** `PAUSE_TOGGLED` is emitted with the correct `paused` boolean
