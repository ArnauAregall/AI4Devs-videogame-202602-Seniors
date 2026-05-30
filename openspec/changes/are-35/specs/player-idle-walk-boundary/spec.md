## ADDED Requirements

### Requirement: Boundary-blocked input transitions Walk to Idle

When the player character is in the Walk state and reaches the top or bottom walkable boundary (`GROUND_TOP` / `GROUND_BOTTOM`), any directional input that would push further toward that boundary MUST cause an immediate transition to the Idle state. No visual sliding against the boundary SHALL occur.

#### Scenario: Up input at top boundary transitions to Idle
- **WHEN** the player is at `_baseY === GROUND_TOP` and holds the `up` directional input
- **THEN** the character transitions to Idle state
- **AND** the Idle animation loops

#### Scenario: Down input at bottom boundary transitions to Idle
- **WHEN** the player is at `_baseY === GROUND_BOTTOM` and holds the `down` directional input
- **THEN** the character transitions to Idle state
- **AND** the Idle animation loops

#### Scenario: Moving away from boundary resumes Walk
- **WHEN** the player is at `GROUND_TOP` in Idle state (blocked by boundary)
- **AND** the player releases `up` and presses `down`
- **THEN** the character transitions to Walk state
- **AND** the Walk animation loops

### Requirement: No directional input transitions Walk to Idle

When the player character is in the Walk state and all directional inputs (left, right, up, down) are released, the character MUST immediately transition to the Idle state. The Idle animation SHALL loop.

#### Scenario: Release all directions at non-boundary position
- **WHEN** the player is holding any directional input (e.g., `right`)
- **AND** the player releases all directional inputs
- **THEN** the character transitions to Idle state
- **AND** the Idle animation loops

#### Scenario: Release all directions at boundary position
- **WHEN** the player is at `GROUND_TOP` holding `up`
- **AND** the player releases `up`
- **THEN** the character transitions to Idle state
- **AND** the Idle animation loops

### Requirement: Directional input at Idle transitions to Walk

When the player character is in the Idle state (and no attack is active), pressing any directional input (left, right, up, down) MUST cause an immediate transition to the Walk state. The Walk animation SHALL loop.

#### Scenario: Press right from Idle
- **WHEN** the player is in Idle state
- **AND** the player presses `right`
- **THEN** the character transitions to Walk state
- **AND** the Walk animation loops
