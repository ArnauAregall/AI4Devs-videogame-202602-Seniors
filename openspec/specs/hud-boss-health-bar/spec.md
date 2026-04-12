## ADDED Requirements

### Requirement: Boss health bar shown on bossArrived, hidden otherwise
`BossHealthBar` SHALL be invisible by default. It SHALL become visible when a `BOSS_ARRIVED` event is received, and SHALL become invisible again when the boss is defeated (indicated by `BOSS_HEALTH_CHANGED` with `current === 0` or a `enemyDefeated` event for the boss).

#### Scenario: Bar hidden before boss arrives
- **WHEN** `HudScene.create()` completes and no boss is present
- **THEN** the boss health bar is not visible

#### Scenario: Bar appears on bossArrived
- **WHEN** `BOSS_ARRIVED` is emitted with `{ maxHealth: 500 }`
- **THEN** the boss health bar becomes visible with full fill width

#### Scenario: Bar disappears on boss defeat
- **WHEN** `BOSS_HEALTH_CHANGED` is emitted with `{ current: 0, max: 500 }`
- **THEN** the boss health bar becomes invisible

### Requirement: Boss health bar positioned at bottom of screen
The boss health bar SHALL be positioned at `HUD_BOSS_BAR_Y` pixels from the top of the canvas, centred horizontally.

#### Scenario: Boss bar at correct y position
- **WHEN** the boss health bar is visible
- **THEN** its centre y equals `HUD_BOSS_BAR_Y`

### Requirement: Boss health bar fill tracks current health
`BOSS_HEALTH_CHANGED` events SHALL update the bar fill width proportionally.

#### Scenario: Boss at half health shows 50% fill
- **WHEN** `BOSS_HEALTH_CHANGED` is emitted with `{ current: 250, max: 500 }`
- **THEN** the boss bar fill width is 50% of the total bar width
