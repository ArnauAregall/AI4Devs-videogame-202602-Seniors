## MODIFIED Requirements

### Requirement: Game Over screen displays on GAME_OVER event
`GameOver` scene SHALL become visible when launched with `{ score, continuesLeft }`
data. It SHALL display the text "GAME OVER" and the player's final score.

#### Scenario: Game Over text visible after launch
- **WHEN** `GameOverScene` is started with `{ score: 4200, continuesLeft: 2 }`
- **THEN** the scene shows "GAME OVER" and `4200`

### Requirement: Game Over screen shows Continue option when continues remain
The scene SHALL show a "Continue" option if `continuesLeft > 0`. The option SHALL
be hidden when `continuesLeft === 0`.

#### Scenario: Continue visible when continues remain
- **WHEN** the scene is launched with `continuesLeft: 1`
- **THEN** a "Continue" option is visible

#### Scenario: Continue hidden when continues exhausted
- **WHEN** the scene is launched with `continuesLeft: 0`
- **THEN** the "Continue" option is not visible

### Requirement: Game Over screen provides Quit to Main Menu option
The scene SHALL always show a "Quit to Main Menu" option.

#### Scenario: Quit option always present
- **WHEN** the Game Over screen is visible
- **THEN** a "Quit to Main Menu" option is visible regardless of continue count

### Requirement: Game Over screen supports keyboard cursor navigation
The scene SHALL support keyboard navigation using the Up and Down arrow keys to
move a cursor between the visible menu options, and Enter to activate the
currently highlighted option.

On `create()`, a cursor index of 0 SHALL be set and the first option SHALL be
visually highlighted (colour `#ffcc00`). Non-selected options SHALL render in
colour `#ffffff`.

Keyboard event listeners SHALL be registered immediately in `create()` — there
SHALL be no input-deaf window after the scene becomes visible.

All keyboard listeners registered by this scene SHALL be removed when the scene
shuts down (via Phaser's built-in scene `shutdown` event or by registering on
`this.input.keyboard`).

#### Scenario: Default selection is first option on create
- **WHEN** the Game Over scene is created
- **THEN** the first visible option is highlighted (`#ffcc00`) and the cursor
  index is 0

#### Scenario: Down arrow moves cursor to next option
- **WHEN** the Down arrow key is pressed while the cursor is at index 0
- **THEN** the cursor moves to index 1 and the highlight updates accordingly

#### Scenario: Up arrow moves cursor to previous option
- **WHEN** the Up arrow key is pressed while the cursor is at index 1
- **THEN** the cursor moves to index 0

#### Scenario: Cursor wraps from last to first
- **WHEN** the Down arrow key is pressed while the cursor is at the last option
- **THEN** the cursor wraps to index 0

#### Scenario: Cursor wraps from first to last
- **WHEN** the Up arrow key is pressed while the cursor is at index 0
- **THEN** the cursor wraps to the last option index

#### Scenario: Enter activates the currently highlighted option
- **WHEN** the cursor is on "Quit to Main Menu" and Enter is pressed
- **THEN** `quitToMenu()` is called, not `handleContinue()`

#### Scenario: Keyboard listener active immediately
- **WHEN** the scene transitions to Game Over
- **THEN** pressing Down arrow on the first rendered frame moves the cursor
  (no input-deaf window)
