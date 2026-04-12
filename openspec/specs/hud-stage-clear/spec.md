## ADDED Requirements

### Requirement: Stage Clear screen displays on STAGE_CLEARED event
`StageClearOverlay` SHALL become visible when `STAGE_CLEARED` is received. It SHALL display "STAGE CLEAR" and the stage score.

#### Scenario: Stage Clear text visible after event
- **WHEN** `STAGE_CLEARED` is emitted with `{ score: 8000, timeBonus: 0 }`
- **THEN** the overlay shows "STAGE CLEAR" and `8000`

### Requirement: Stage Clear screen shows time bonus when timer was active
If `STAGE_CLEARED` is received with `timeBonus > 0`, the overlay SHALL display the time bonus value.

#### Scenario: Time bonus shown when present
- **WHEN** `STAGE_CLEARED` is emitted with `{ score: 8000, timeBonus: 500 }`
- **THEN** the overlay displays the time bonus `500`

#### Scenario: Time bonus hidden when zero
- **WHEN** `STAGE_CLEARED` is emitted with `{ score: 8000, timeBonus: 0 }`
- **THEN** no time bonus text is visible

### Requirement: Stage Clear screen is reachable from any gameplay state
The overlay SHALL be triggerable without a scene reload, consistent with NFR-HU-02.

#### Scenario: Stage clear triggers in active gameplay
- **WHEN** the stage clear condition fires during normal gameplay
- **THEN** the Stage Clear overlay becomes visible without reloading any scene
