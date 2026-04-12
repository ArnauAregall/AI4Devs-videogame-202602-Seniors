## ADDED Requirements

### Requirement: Boss HP and named constant
`BossController` SHALL initialise with `BOSS_MAX_HP` hit points. `BOSS_MAX_HP` is defined in `EnemyConfig` and is distinct from all regular archetype HP values. References: FR-EA-24.

#### Scenario: Boss initialises at BOSS_MAX_HP
- **WHEN** BossController is constructed
- **THEN** currentHP equals BOSS_MAX_HP

### Requirement: Boss phase 2 transition at 50% HP
`BossController` SHALL detect when HP drops to or below `BOSS_MAX_HP * 0.5` and transition to phase 2 exactly once. Phase 2 adds a spinning-kick hitbox option. A short visual transition animation plays for `BOSS_TRANSITION_FRAMES` ticks during which AI updates are suspended. References: FR-EA-21, FR-EA-22.

#### Scenario: Phase 2 triggers once at 50% HP
- **WHEN** HP crosses the 50% threshold (from above)
- **THEN** _phase becomes 2 and _transitioning is set for BOSS_TRANSITION_FRAMES ticks

#### Scenario: Phase 2 transition fires only once
- **WHEN** boss is already in phase 2 and HP continues to drop
- **THEN** no second phase-2 transition fires

### Requirement: Boss phase 3 transition at 25% HP
`BossController` SHALL detect when HP drops to or below `BOSS_MAX_HP * 0.25` and transition to phase 3 exactly once. Phase 3 increases `_walkSpeed` by `BOSS_PHASE3_SPEED_MULTIPLIER` and halves `_attackCooldownFrames`. References: FR-EA-21, FR-EA-23.

#### Scenario: Phase 3 increases speed and frequency
- **WHEN** boss transitions to phase 3
- **THEN** walkSpeed = original × BOSS_PHASE3_SPEED_MULTIPLIER and attackCooldownFrames halved

### Requirement: Boss locks camera on arrival
When `BossController` is spawned, it SHALL emit `bossArrived` on the Phaser scene's event emitter. `EnemyManager` listens for this event and emits it to the StageManager, which locks the camera. References: FR-EA-20.

#### Scenario: Camera locks when boss spawns
- **WHEN** BossController is constructed and activated
- **THEN** scene events emit 'bossArrived' and camera stops scrolling
