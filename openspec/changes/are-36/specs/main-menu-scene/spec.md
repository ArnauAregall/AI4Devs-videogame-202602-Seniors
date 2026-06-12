## MODIFIED Requirements

### Requirement: Main menu is a separate interactive scene
The system SHALL implement `MainMenuScene` as a standalone Phaser scene (not a modal or overlay). It is the first scene the player interacts with after loading. It SHALL support keyboard (arrow keys + Enter), mouse/pointer, and gamepad navigation for cycling through and selecting menu options.

#### Scenario: Main menu is reachable after preload
- **WHEN** `PreloadScene` finishes loading
- **THEN** `MainMenuScene` starts and displays at minimum a "Start Game" option

#### Scenario: Menu supports keyboard navigation
- **WHEN** the player presses arrow keys and Enter
- **THEN** the cursor cycles through options and Enter activates the selected option

#### Scenario: Menu supports gamepad navigation
- **WHEN** the player uses a connected gamepad's D-pad and confirm button
- **THEN** the cursor cycles through options and the confirm button activates the selected option
