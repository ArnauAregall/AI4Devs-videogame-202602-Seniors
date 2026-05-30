## ADDED Requirements

### Requirement: Player health bar displays current health proportion
`HealthBar` SHALL render a rectangular bar whose filled width is proportional to `current / max` health. The bar SHALL update within one frame of receiving a `PLAYER_HEALTH_CHANGED` event.

#### Scenario: Full health shows full bar
- **WHEN** `PLAYER_HEALTH_CHANGED` is emitted with `current === max`
- **THEN** the bar fill width equals 100% of bar width

#### Scenario: Zero health shows empty bar
- **WHEN** `PLAYER_HEALTH_CHANGED` is emitted with `current === 0`
- **THEN** the bar fill width equals 0

### Requirement: Health bar colour changes by threshold
The bar colour SHALL be:
- `HUD_HEALTH_GREEN` when `current / max > HUD_HEALTH_YELLOW_THRESHOLD`
- `HUD_HEALTH_YELLOW` when `HUD_HEALTH_RED_THRESHOLD < current / max <= HUD_HEALTH_YELLOW_THRESHOLD`
- `HUD_HEALTH_RED` when `current / max <= HUD_HEALTH_RED_THRESHOLD`

#### Scenario: High health is green
- **WHEN** health fraction is 0.8
- **THEN** bar fill colour is `HUD_HEALTH_GREEN`

#### Scenario: Medium health is yellow
- **WHEN** health fraction is 0.4 (below yellow threshold, above red threshold)
- **THEN** bar fill colour is `HUD_HEALTH_YELLOW`

#### Scenario: Low health is red
- **WHEN** health fraction is 0.2 (at or below red threshold)
- **THEN** bar fill colour is `HUD_HEALTH_RED`

### Requirement: Health bar render depth above all game layers
`HealthBar` SHALL render its graphics at `HUD_DEPTH` (defined as 9999) so it appears above all game sprites and stage layers.

#### Scenario: Health bar renders above game sprites
- **WHEN** any game sprite occupies the same screen region as the health bar
- **THEN** the health bar is drawn on top
