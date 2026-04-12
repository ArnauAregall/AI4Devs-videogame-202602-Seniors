## MODIFIED Requirements

### Requirement: Hurt interrupt
Any incoming HitEvent MUST immediately transition the enemy to Hurt state (except when in Death or Knockdown state). Hurt state lasts `hitStunFrames` ticks before returning to Aggro. Knockback applied by a HitEvent SHALL be horizontal only — `setVelocityY(0)` is called regardless of `event.knockbackY`. References: FR-EA-11.

#### Scenario: Hit interrupts Patrol
- **WHEN** enemy is in Patrol state and receives a HitEvent
- **THEN** state transitions to Hurt

#### Scenario: Hit does not interrupt Death
- **WHEN** enemy is in Death state and receives a HitEvent
- **THEN** state remains Death and no further transition fires

#### Scenario: Knockback is horizontal only
- **WHEN** a HitEvent with non-zero knockbackY is received
- **THEN** enemy sprite Y velocity is set to 0 (no upward launch)

#### Scenario: Enemy stays within canvas vertically
- **WHEN** any HitEvent is applied
- **THEN** enemy sprite Y position remains within `[GROUND_TOP, GROUND_BOTTOM]` bounds

## ADDED Requirements

### Requirement: Enemy physics body vertical bounds
`EnemyController` SHALL enable `setCollideWorldBounds(true)` on the Arcade sprite body at construction time so enemies cannot exit the canvas vertically or horizontally through world edges. The Arcade physics world gravity SHALL apply to the enemy body.

#### Scenario: Enemy does not exit canvas top
- **WHEN** the enemy sprite would move above worldBounds.top
- **THEN** the sprite Y position is clamped to worldBounds.top by Arcade physics

#### Scenario: Enemy has gravity applied
- **WHEN** an enemy has no vertical velocity input
- **THEN** the enemy sprite Y accelerates downward at the scene gravity rate
