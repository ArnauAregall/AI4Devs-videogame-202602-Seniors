## MODIFIED Requirements

### Requirement: Player health bar displays current health proportion
`HealthBar` SHALL render a rectangular bar on the fixed HUD overlay whose filled width equals `current / max` of the 100 HP maximum. The bar SHALL update its width within the same render frame when a `PLAYER_HEALTH_CHANGED` event fires, with no visible lag.

#### Scenario: Full health shows full bar
- **WHEN** `PLAYER_HEALTH_CHANGED` is emitted with `current === max`
- **THEN** the bar fill width equals 100% of `HUD_HEALTH_BAR_WIDTH`

#### Scenario: Zero health shows empty bar
- **WHEN** `PLAYER_HEALTH_CHANGED` is emitted with `current === 0`
- **THEN** the bar fill width equals 0

#### Scenario: Same-frame update on damage
- **WHEN** the player receives damage and `PLAYER_HEALTH_CHANGED` fires
- **THEN** the health bar width reflects the new health value before the current frame renders

### Requirement: Health bar colour changes by threshold
The bar colour SHALL change based on named threshold constants defined in `HudConfig.ts`:
- `HUD_HEALTH_GREEN` when `current / max > HUD_HEALTH_YELLOW_THRESHOLD`
- `HUD_HEALTH_YELLOW` when `HUD_HEALTH_RED_THRESHOLD < current / max <= HUD_HEALTH_YELLOW_THRESHOLD`
- `HUD_HEALTH_RED` when `current / max <= HUD_HEALTH_RED_THRESHOLD`

#### Scenario: High health is green
- **WHEN** health fraction is above `HUD_HEALTH_YELLOW_THRESHOLD`
- **THEN** bar fill colour is `HUD_HEALTH_GREEN`

#### Scenario: Medium health is yellow
- **WHEN** health fraction is at or below `HUD_HEALTH_YELLOW_THRESHOLD` and above `HUD_HEALTH_RED_THRESHOLD`
- **THEN** bar fill colour is `HUD_HEALTH_YELLOW`

#### Scenario: Low health is red
- **WHEN** health fraction is at or below `HUD_HEALTH_RED_THRESHOLD`
- **THEN** bar fill colour is `HUD_HEALTH_RED`

### Requirement: Thresholds are designer-tunable named constants
Colour thresholds SHALL be defined as named exported constants (`HUD_HEALTH_YELLOW_THRESHOLD`, `HUD_HEALTH_RED_THRESHOLD`) in `HudConfig.ts`. A designer SHALL be able to change threshold values by editing only `HudConfig.ts` without modifying `HealthBar.ts` or any business logic file.

#### Scenario: Changing threshold does not require business logic changes
- **WHEN** a designer modifies `HUD_HEALTH_YELLOW_THRESHOLD` in `HudConfig.ts`
- **THEN** the health bar uses the new threshold at next build without changes to `HealthBar.ts`
