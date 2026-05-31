## MODIFIED Requirements

### Requirement: InputManager polls keyboard every fixed tick
The system SHALL implement `InputManager.poll()` which reads Phaser's keyboard cursors and configured keys and returns a frozen `InputState` snapshot. `poll()` MUST be called exactly once per fixed-timestep update — never per render frame — to ensure deterministic input behaviour independent of frame rate.

#### Scenario: Poll returns correct move direction
- **WHEN** the right arrow key is held and `poll()` is called
- **THEN** `inputState.right` is `true` and `inputState.left` is `false`

#### Scenario: Multiple inputs captured simultaneously
- **WHEN** both right arrow and Z (light attack) are held
- **THEN** `inputState.right` is `true` and `inputState.lightAttack` is `true`

#### Scenario: Poll is called once per fixed-timestep update
- **WHEN** the game loop executes a fixed-timestep tick
- **THEN** `poll()` is invoked exactly once before any consumer reads the snapshot

#### Scenario: Poll is not called per render frame
- **WHEN** multiple render frames occur between fixed-timestep ticks
- **THEN** `poll()` is not invoked during those intermediate render frames

### Requirement: Default keyboard mapping matches FR-PL-12
The system SHALL map the following keys by default: Arrow keys and WASD for movement (left/right/up/down); Z or J for `lightAttack`; X or K for `heavyAttack`; C or L for `grab`; Space for `jump`; Enter for `specialAttack`. All mappings MUST be active simultaneously so either key in a pair triggers the action.

#### Scenario: Arrow keys control movement
- **WHEN** the LEFT arrow key is held and `poll()` is called
- **THEN** `inputState.left` is `true`

#### Scenario: WASD movement is captured
- **WHEN** the W key is held and `poll()` is called
- **THEN** `inputState.up` is `true`

#### Scenario: Alternative attack keys work
- **WHEN** the J key (not Z) is held
- **THEN** `inputState.lightAttack` is `true`

#### Scenario: Heavy attack alternate key works
- **WHEN** the K key is held
- **THEN** `inputState.heavyAttack` is `true`

#### Scenario: Grab alternate key works
- **WHEN** the L key is held
- **THEN** `inputState.grab` is `true`

#### Scenario: Space triggers jump
- **WHEN** the Space key is pressed
- **THEN** `inputState.jump` is `true`

#### Scenario: Enter triggers special attack
- **WHEN** the Enter key is pressed
- **THEN** `inputState.specialAttack` is `true`
