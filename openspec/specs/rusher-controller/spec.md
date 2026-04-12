## ADDED Requirements

### Requirement: Rusher stays Idle until aggro radius
`RusherController` SHALL remain in Idle state (no movement, no patrol) until the player enters `RUSHER_AGGRO_RADIUS`. Once aggro'd, it charges at `RUSHER_CHARGE_SPEED` and performs a 3-hit flurry. References: FR-EA-01, FR-EA-03.

#### Scenario: Rusher remains stationary before aggro
- **WHEN** player is outside RUSHER_AGGRO_RADIUS
- **THEN** rusher remains in Idle state with no movement

#### Scenario: Rusher charges at high speed when aggro'd
- **WHEN** player enters RUSHER_AGGRO_RADIUS
- **THEN** state transitions to Aggro and rusher moves at RUSHER_CHARGE_SPEED

### Requirement: Rusher 3-hit flurry attack
`RusherController` SHALL execute 3 hitbox registrations during Attack state, spaced `RUSHER_FLURRY_GAP_FRAMES` apart. Each hit uses `RUSHER_FLURRY_DAMAGE` and LIGHT knockback. References: FR-EA-03.

#### Scenario: Flurry registers three hits on a stationary target
- **WHEN** RusherController enters Attack with a target in range
- **THEN** three separate hitbox registrations occur, each RUSHER_FLURRY_GAP_FRAMES apart

#### Scenario: Flurry returns to Aggro after all three hits
- **WHEN** the third hit timer expires
- **THEN** state transitions back to Aggro
