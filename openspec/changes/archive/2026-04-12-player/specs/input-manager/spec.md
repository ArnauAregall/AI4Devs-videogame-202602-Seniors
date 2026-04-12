## ADDED Requirements

### Requirement: InputManager polls keyboard every fixed tick
The system SHALL implement `InputManager.poll()` which reads Phaser's keyboard cursors and configured keys and returns a frozen `InputState` snapshot. `poll()` MUST be called once per fixed tick before any consumer reads it.

#### Scenario: Poll returns correct move direction
- **WHEN** the right arrow key is held and `poll()` is called
- **THEN** `inputState.right` is `true` and `inputState.left` is `false`

#### Scenario: Multiple inputs captured simultaneously
- **WHEN** both right arrow and Z (light attack) are held
- **THEN** `inputState.right` is `true` and `inputState.lightAttack` is `true`

### Requirement: Default keyboard mapping matches FR-PL-12
The system SHALL map the following keys by default: Arrow keys and WASD for movement; Z or J for `lightAttack`; X or K for `heavyAttack`; C or L for `grab`; Space for `jump`; Enter for `specialAttack`.

#### Scenario: WASD movement is captured
- **WHEN** the W key is held and `poll()` is called
- **THEN** `inputState.up` is `true`

#### Scenario: Alternative attack keys work
- **WHEN** the J key (not Z) is held
- **THEN** `inputState.lightAttack` is `true`

### Requirement: Gamepad input maps to the same InputState fields
The system SHALL read the connected gamepad (index 0) and map: left stick / d-pad for movement; A/Cross for `jump`; X/Square for `lightAttack`; Y/Triangle for `heavyAttack`; B/Circle for `grab`; LB/L1 for `specialAttack`. Gamepad and keyboard inputs are OR-combined.

#### Scenario: Gamepad and keyboard are additive
- **WHEN** the gamepad d-pad left is held AND the left arrow key is also held
- **THEN** `inputState.left` is `true` (both sources contribute)

### Requirement: Gamepad connect/disconnect is handled gracefully
The system SHALL detect gamepad connection and disconnection events without throwing or crashing. When a gamepad disconnects mid-game, `InputManager` MUST fall back to keyboard-only input silently.

#### Scenario: Disconnected gamepad falls back to keyboard
- **WHEN** a gamepad disconnects and `poll()` is called
- **THEN** no exception is thrown and keyboard input still functions
