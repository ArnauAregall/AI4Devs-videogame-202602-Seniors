# game-states Specification

## Purpose
TBD - created by archiving change game-loop. Update Purpose after archive.
## Requirements
### Requirement: Game Over state halts gameplay and shows overlay
The system SHALL implement a `GameOverScene` that launches as an overlay when the player's lives reach zero. `GameScene` is paused for the duration. The overlay displays "GAME OVER", the player's final score, and options: "Continue" (if continues remain) and "Quit to Main Menu".

#### Scenario: Game over triggers on last life lost
- **WHEN** the player's lives counter reaches zero in `GameScene`
- **THEN** `GameOverScene` launches as an overlay and `GameScene` pauses

#### Scenario: Continue option restarts gameplay
- **WHEN** the player selects "Continue" and continues are available
- **THEN** `GameOverScene` stops and `GameScene` resumes with the player respawned

#### Scenario: Continue option is hidden when exhausted
- **WHEN** all continues have been used
- **THEN** the "Continue" option is not shown in `GameOverScene`

#### Scenario: Quit returns to main menu
- **WHEN** the player selects "Quit to Main Menu"
- **THEN** `GameScene` and `GameOverScene` stop and `MainMenuScene` starts

### Requirement: Stage Clear state plays sequence and advances
The system SHALL implement a `StageClearScene` that launches as an overlay when the stage clear condition is met. It displays "STAGE CLEAR", the stage score, and a time bonus (if time remains). After the sequence completes, it transitions to the next stage or to the end screen after stage 3.

#### Scenario: Stage clear triggers on condition met
- **WHEN** all enemies in all spawn zones are defeated and the player reaches the end of the stage
- **THEN** `StageClearScene` launches as an overlay

#### Scenario: Advance to next stage after sequence
- **WHEN** the stage clear sequence completes and the current stage is not the last
- **THEN** `GameScene` reloads for the next stage

#### Scenario: End screen after final stage
- **WHEN** the stage clear sequence completes for stage `STAGE_COUNT`
- **THEN** the game transitions to an end screen (or `MainMenuScene` as a placeholder)

### Requirement: Time Up state triggers on countdown expiry
The system SHALL implement a `TimeUpScene` overlay triggered when the stage countdown timer reaches zero. It halts gameplay and transitions to a continue prompt if continues are available, or to Game Over if none remain.

#### Scenario: Time up halts gameplay
- **WHEN** the stage countdown timer reaches zero
- **THEN** `TimeUpScene` launches and `GameScene` pauses

#### Scenario: Time up with continues available goes to continue prompt
- **WHEN** `TimeUpScene` activates and continues are available
- **THEN** the player is offered a continue prompt (reuses `GameOverScene` continue logic)

#### Scenario: Time up with no continues goes to game over
- **WHEN** `TimeUpScene` activates and no continues remain
- **THEN** the game transitions to `GameOverScene` without a continue option

