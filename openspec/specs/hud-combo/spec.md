## ADDED Requirements

### Requirement: Combo counter shown at 2+ hits and hidden on expiry
`ComboCounter` SHALL be invisible when the combo count is below `HUD_COMBO_MIN_COUNT` (2). It SHALL become visible and display the hit count when `COMBO_UPDATED` is received with `count >= HUD_COMBO_MIN_COUNT`. It SHALL become invisible again when `COMBO_UPDATED` is received with `windowActive: false`.

#### Scenario: Combo hidden below minimum
- **WHEN** `COMBO_UPDATED` is emitted with `{ count: 1, windowActive: true }`
- **THEN** the combo counter is not visible

#### Scenario: Combo shown at minimum threshold
- **WHEN** `COMBO_UPDATED` is emitted with `{ count: 2, windowActive: true }`
- **THEN** the combo counter is visible and shows `2`

#### Scenario: Combo hidden when window expires
- **WHEN** `COMBO_UPDATED` is emitted with `{ count: 5, windowActive: false }`
- **THEN** the combo counter becomes invisible

### Requirement: Combo counter shows hit count only
The combo counter SHALL display only the hit count number, not the accumulated damage total (per FR-HU-21).

#### Scenario: Combo displays count not damage
- **WHEN** `COMBO_UPDATED` is emitted with `{ count: 7, windowActive: true }`
- **THEN** the display shows `7` (or "7 HIT"), not a damage value
