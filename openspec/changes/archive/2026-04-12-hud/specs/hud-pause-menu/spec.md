## ADDED Requirements

### Requirement: Pause menu displays on PAUSE_TOGGLED event
`PauseMenuOverlay` SHALL become visible and `GameScene` SHALL be paused when `PAUSE_TOGGLED` with `{ paused: true }` is received. It SHALL be hidden and `GameScene` SHALL be resumed on `PAUSE_TOGGLED` with `{ paused: false }`.

#### Scenario: Pause overlay shown when game paused
- **WHEN** `PAUSE_TOGGLED` is emitted with `{ paused: true }`
- **THEN** the pause overlay is visible and GameScene is paused

#### Scenario: Pause overlay hidden on resume
- **WHEN** `PAUSE_TOGGLED` is emitted with `{ paused: false }`
- **THEN** the pause overlay is invisible and GameScene resumes

### Requirement: Pause menu provides Resume, View Controls, Quit options
The overlay SHALL display three options: "Resume", "View Controls", "Quit to Main Menu".

#### Scenario: All three options present
- **WHEN** the pause overlay is visible
- **THEN** "Resume", "View Controls", and "Quit to Main Menu" options are all displayed

### Requirement: Pause menu supports keyboard and gamepad navigation
Menu cursor SHALL move between options using ↑/↓ keys or D-pad. Confirm selection using Enter or gamepad A button.

#### Scenario: Keyboard down moves cursor
- **WHEN** the pause overlay is visible and the down arrow key is pressed
- **THEN** the cursor moves to the next option

#### Scenario: Enter confirms selection
- **WHEN** the cursor is on "Resume" and Enter is pressed
- **THEN** the pause is toggled off and gameplay resumes

#### Scenario: Gamepad D-pad navigates menu
- **WHEN** the gamepad D-pad down is pressed
- **THEN** the cursor moves to the next menu option
