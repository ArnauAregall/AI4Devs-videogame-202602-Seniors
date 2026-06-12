## ADDED Requirements

### Requirement: Idle animation loops continuously when no directional input is held and no attack is active
The system SHALL play the Idle animation (`ASSET_KEY_PLAYER_IDLE`) on a continuous loop whenever the player state is `Idle`. The animation MUST NOT stop, reset, or flicker as long as the state remains `Idle`.

#### Scenario: Idle plays on session start
- **WHEN** a gameplay session begins and no directional input is held
- **THEN** the player character plays the Idle animation looping continuously

#### Scenario: Idle continues indefinitely without input
- **WHEN** the player is in Idle state and no input is pressed for multiple seconds
- **THEN** the Idle animation continues looping without interruption

### Requirement: Walk animation loops continuously when directional input is held
The system SHALL play the Walk animation (`ASSET_KEY_PLAYER_WALK`) on a continuous loop whenever the player state is `Walk`. The animation MUST loop for as long as any directional key (Arrow or WASD) is held and the state remains `Walk`.

#### Scenario: Pressing a directional key starts Walk animation
- **WHEN** the player is in Idle state and a directional key is pressed and held
- **THEN** the player character transitions to Walk state and the Walk animation plays looping

#### Scenario: Walk loops while directional input is held
- **WHEN** the player is in Walk state and a directional key remains held
- **THEN** the Walk animation continues looping without reset or interruption

### Requirement: Releasing all directional inputs immediately transitions Walk to Idle
The system SHALL transition from Walk to Idle on the same fixed-update tick that all directional inputs become released. The Idle animation MUST begin playing immediately with no transition delay.

#### Scenario: Releasing directional keys returns to Idle
- **WHEN** the player is in Walk state and all directional keys are released
- **THEN** the player state becomes Idle and the Idle animation begins on that tick

#### Scenario: Releasing one directional key while another is held stays in Walk
- **WHEN** the player is holding right and up, and releases right but keeps holding up
- **THEN** the player remains in Walk state and the Walk animation continues

### Requirement: Player transitions to Idle when clamped at vertical boundary with only vertical input
The system SHALL transition the player from Walk to Idle when the player's y-position is clamped at `GROUND_TOP` or `GROUND_BOTTOM` and no horizontal directional input is held. This ensures the Walk animation does not play when there is no effective movement.

#### Scenario: Walking up into top boundary stops and shows Idle
- **WHEN** the player holds only the up key and reaches `GROUND_TOP`
- **THEN** the player state transitions to Idle and the Idle animation plays

#### Scenario: Walking down into bottom boundary stops and shows Idle
- **WHEN** the player holds only the down key and reaches `GROUND_BOTTOM`
- **THEN** the player state transitions to Idle and the Idle animation plays

#### Scenario: Walking diagonally into vertical boundary while holding horizontal key stays Walk
- **WHEN** the player holds up+right and reaches `GROUND_TOP`
- **THEN** the player remains in Walk state because horizontal movement is still effective
