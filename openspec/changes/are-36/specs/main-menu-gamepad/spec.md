## ADDED Requirements

### Requirement: Gamepad D-pad cycles menu options
The system SHALL detect gamepad D-pad up/down input in `MainMenuScene.update()` and cycle the cursor through menu options, wrapping at boundaries.

#### Scenario: D-pad down moves cursor to next option
- **WHEN** the player presses D-pad down on a connected gamepad
- **THEN** the cursor advances to the next menu option and the highlight updates

#### Scenario: D-pad up moves cursor to previous option
- **WHEN** the player presses D-pad up on a connected gamepad
- **THEN** the cursor moves to the previous menu option and the highlight updates

#### Scenario: Cursor wraps from last to first
- **WHEN** the cursor is on the last option and D-pad down is pressed
- **THEN** the cursor wraps to the first option

#### Scenario: Cursor wraps from first to last
- **WHEN** the cursor is on the first option and D-pad up is pressed
- **THEN** the cursor wraps to the last option

### Requirement: Gamepad confirm button activates selected option
The system SHALL activate the currently highlighted menu option when the player presses gamepad button index 0 (A/Cross).

#### Scenario: Confirm on Start Game transitions to GameScene
- **WHEN** the cursor is on "START GAME" and the player presses button 0
- **THEN** `GameScene` starts

#### Scenario: Confirm on High Scores transitions to LeaderboardScene
- **WHEN** the cursor is on "HIGH SCORES" and the player presses button 0
- **THEN** `LeaderboardScene` starts with `returnScene: 'MainMenuScene'`

### Requirement: Gamepad input is debounced
The system SHALL enforce a cooldown of approximately 200ms between accepted gamepad inputs to prevent rapid-fire cycling from held buttons.

#### Scenario: Held D-pad does not rapid-cycle
- **WHEN** the player holds D-pad down continuously
- **THEN** the cursor moves at most once per ~200ms
