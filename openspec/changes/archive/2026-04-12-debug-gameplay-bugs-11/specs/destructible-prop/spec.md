## MODIFIED Requirements

### Requirement: FR-DP-02 Hit detection via hitbox overlap
A `DestructibleProp` SHALL track hits via an integer counter `_hitCount`. Each call to `hit()` SHALL increment `_hitCount` by 1. The prop SHALL be destroyed when `_hitCount` reaches 3. No blocking physics body SHALL exist on the prop sprite; the player sprite must pass through the prop without physical resistance.

#### Scenario: Prop tracks three hits then destroys
- **WHEN** `hit()` is called three times on an active prop
- **THEN** the prop transitions to its crushed state and begins the destroy sequence

#### Scenario: Dead prop does not respond to hits
- **WHEN** prop is already destroyed
- **THEN** further `hit()` calls are ignored

#### Scenario: Player passes through barrel without obstruction
- **WHEN** the player sprite overlaps the barrel sprite in the world
- **THEN** player movement is unaffected (no physics collision response)

### Requirement: FR-DP-05 Dual-state sprite visibility
`DestructibleProp` SHALL render two sprite objects at the same world position: a healthy sprite and a crushed sprite. On creation the healthy sprite SHALL be visible and the crushed sprite SHALL be invisible. On the third hit the healthy sprite SHALL become invisible and the crushed sprite SHALL become visible. After a 300 ms delay the prop SHALL call its destroy sequence.

#### Scenario: Healthy sprite visible on creation
- **WHEN** a `DestructibleProp` is constructed
- **THEN** `healthySprite.visible === true` and `crushedSprite.visible === false`

#### Scenario: State swap on third hit
- **WHEN** `hit()` is called for the third time
- **THEN** `healthySprite.visible === false` and `crushedSprite.visible === true`

#### Scenario: Destroy fires after 300 ms delay
- **WHEN** the third hit is applied
- **THEN** both sprites are destroyed within 800 ms total (300 ms delay + 500 ms tween)
