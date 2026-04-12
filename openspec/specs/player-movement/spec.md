# player-movement Specification

## Purpose
TBD - created by archiving change player. Update Purpose after archive.
## Requirements
### Requirement: Player cannot walk off the top or bottom of the ground plane
The system SHALL clamp `player.y` to the range `[GameConfig.GROUND_TOP, GameConfig.GROUND_BOTTOM]` every fixed tick. Vertical input beyond these bounds SHALL be ignored.

#### Scenario: Player cannot move above ground top
- **WHEN** the player moves upward and `y` reaches `GameConfig.GROUND_TOP`
- **THEN** `y` is clamped to `GameConfig.GROUND_TOP` and upward velocity is zeroed

#### Scenario: Player cannot move below ground bottom
- **WHEN** the player moves downward and `y` reaches `GameConfig.GROUND_BOTTOM`
- **THEN** `y` is clamped to `GameConfig.GROUND_BOTTOM` and downward velocity is zeroed

### Requirement: Player horizontal speed is constrained relative to camera scroll
The system SHALL define `GameConfig.PLAYER_WALK_SPEED` such that it is less than or equal to `GameConfig.CAMERA_MAX_SCROLL_SPEED`. The player MUST NOT be able to outrun the camera.

#### Scenario: Walk speed does not exceed camera scroll speed
- **WHEN** `GameConfig` constants are read
- **THEN** `GameConfig.PLAYER_WALK_SPEED <= GameConfig.CAMERA_MAX_SCROLL_SPEED`

### Requirement: Jump follows a fixed arc using vertical velocity
The system SHALL set a vertical velocity of `-GameConfig.JUMP_VELOCITY` on entering `Jump` state. Gravity is zero (beat-em-up convention), so the game applies a custom "fall" deceleration each tick until `y` returns to the pre-jump `y` value (the ground level), at which point the state transitions back to `Idle`.

#### Scenario: Jump reaches apex and returns
- **WHEN** the player enters `Jump` and no input is applied
- **THEN** the player ascends, reaches apex, descends, and transitions to `Idle` on landing

#### Scenario: Jumping from any y position returns to the same y
- **WHEN** the player jumps from `y = 100`
- **THEN** after the jump arc completes, `y === 100`

