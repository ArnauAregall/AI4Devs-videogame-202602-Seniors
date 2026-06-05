## ADDED Requirements

### Requirement: Main menu supports gamepad navigation
The system SHALL allow the player to navigate menu options using a connected gamepad's d-pad or left stick (up/down) with a dead zone of 0.5 and a debounce cooldown of at least 200ms.

#### Scenario: Gamepad d-pad moves cursor down
- **WHEN** the Main Menu is displayed and the player presses d-pad down on a connected gamepad
- **THEN** the focused option changes to the next item below

#### Scenario: Gamepad left stick moves cursor up
- **WHEN** the Main Menu is displayed and the player pushes the left stick up past the dead zone
- **THEN** the focused option changes to the previous item above

#### Scenario: Held d-pad does not rapidly scroll
- **WHEN** the player holds d-pad down continuously
- **THEN** the cursor moves at most once per 200ms debounce interval

### Requirement: Main menu supports gamepad confirm
The system SHALL allow the player to activate the currently focused menu option by pressing the A/Cross button (button index 0) on a connected gamepad.

#### Scenario: Gamepad A button activates Start Game
- **WHEN** "Start Game" is focused and the player presses the A button
- **THEN** the game transitions to `GameScene`

#### Scenario: Gamepad A button activates High Scores
- **WHEN** "High Scores" is focused and the player presses the A button
- **THEN** the game navigates to `LeaderboardScene`

### Requirement: Main menu degrades gracefully without gamepad
The system SHALL continue to function with keyboard and mouse input when no gamepad is connected, without errors or visual glitches.

#### Scenario: No gamepad connected
- **WHEN** the Main Menu is displayed and no gamepad is connected
- **THEN** keyboard and mouse navigation work normally and no errors are thrown
