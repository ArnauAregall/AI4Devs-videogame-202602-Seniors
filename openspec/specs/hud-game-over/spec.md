## ADDED Requirements

### Requirement: Game Over screen displays on GAME_OVER event
`GameOverOverlay` SHALL become visible when `GAME_OVER` is received. It SHALL display the text "GAME OVER" and the player's final score.

#### Scenario: Game Over text visible after event
- **WHEN** `GAME_OVER` is emitted with `{ score: 4200 }`
- **THEN** the overlay shows "GAME OVER" and `4200`

### Requirement: Game Over screen shows Continue option when continues remain
The overlay SHALL show a "Continue" option if the current continue count is less than `HUD_MAX_CONTINUES` (3). The option SHALL be hidden once all continues are exhausted.

#### Scenario: Continue visible when continues remain
- **WHEN** `GAME_OVER` is received and continues used is 0
- **THEN** a "Continue" option is visible

#### Scenario: Continue hidden when continues exhausted
- **WHEN** `GAME_OVER` is received and continues used equals `HUD_MAX_CONTINUES`
- **THEN** the "Continue" option is not visible

### Requirement: Game Over screen provides Quit to Main Menu option
The overlay SHALL always show a "Quit to Main Menu" option that, when selected, transitions to `MainMenuScene`.

#### Scenario: Quit option always present
- **WHEN** the Game Over screen is visible
- **THEN** a "Quit to Main Menu" option is visible regardless of continue count

#### Scenario: Selecting Quit transitions to main menu
- **WHEN** the player selects "Quit to Main Menu"
- **THEN** the game transitions to `MainMenuScene`
