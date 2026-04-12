## ADDED Requirements

### Requirement: Main menu is a separate interactive scene
The system SHALL implement `MainMenuScene` as a standalone Phaser scene (not a modal or overlay). It is the first scene the player interacts with after loading.

#### Scenario: Main menu is reachable after preload
- **WHEN** `PreloadScene` finishes loading
- **THEN** `MainMenuScene` starts and displays at minimum a "Start Game" option

### Requirement: Main menu starts the game scene
The system SHALL provide a "Start Game" action in `MainMenuScene` that transitions to `GameScene`.

#### Scenario: Start Game transitions to GameScene
- **WHEN** the player activates the "Start Game" option (keyboard confirm or mouse click)
- **THEN** `GameScene` starts and `MainMenuScene` stops

### Requirement: Main menu is accessible from game over
The system SHALL support returning to `MainMenuScene` from the Game Over overlay.

#### Scenario: Quit from game over returns to main menu
- **WHEN** the player selects "Quit to Main Menu" from the Game Over screen
- **THEN** `GameScene` and any overlay scenes stop, and `MainMenuScene` starts
