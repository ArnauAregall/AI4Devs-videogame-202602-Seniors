## ADDED Requirements

### Requirement: Canvas dimensions are named constants
The system SHALL define canvas width and height as exported named constants in `GameConfig.ts`. No scene or entity file SHALL use inline pixel values for canvas dimensions.

#### Scenario: Canvas dimensions are accessible
- **WHEN** any scene or module imports `GameConfig`
- **THEN** `GameConfig.CANVAS_WIDTH` and `GameConfig.CANVAS_HEIGHT` are available as non-zero positive integers

### Requirement: Target frame rate is a named constant
The system SHALL define the target rendering frame rate as `GameConfig.TARGET_FPS` (default 60).

#### Scenario: Target FPS is readable
- **WHEN** any module imports `GameConfig`
- **THEN** `GameConfig.TARGET_FPS` equals 60

### Requirement: Fixed-timestep delta is a named constant
The system SHALL define `GameConfig.FIXED_DELTA_MS` as `1000 / TARGET_FPS` (approximately 16.667 ms).

#### Scenario: Fixed delta matches target FPS
- **WHEN** `GameConfig.FIXED_DELTA_MS` is read
- **THEN** its value equals `1000 / GameConfig.TARGET_FPS`

### Requirement: Max steps per frame is a named constant
The system SHALL define `GameConfig.MAX_STEPS_PER_FRAME` (default 3) to cap fixed-timestep catch-up.

#### Scenario: Max steps constant is present
- **WHEN** any module imports `GameConfig`
- **THEN** `GameConfig.MAX_STEPS_PER_FRAME` is a positive integer greater than zero

### Requirement: Stage count is a named constant
The system SHALL define `GameConfig.STAGE_COUNT` (default 3). No scene SHALL hard-code the total number of stages.

#### Scenario: Stage count is correct
- **WHEN** `GameConfig.STAGE_COUNT` is read
- **THEN** its value equals 3

### Requirement: Arcade physics gravity is zero
The system SHALL configure Arcade Physics with `gravity.y = 0` (beat-'em-up uses a ground plane, not gravity).

#### Scenario: Physics gravity is zero at game start
- **WHEN** the Phaser game instance is created using `GameConfig`
- **THEN** Arcade Physics gravity.y is 0
