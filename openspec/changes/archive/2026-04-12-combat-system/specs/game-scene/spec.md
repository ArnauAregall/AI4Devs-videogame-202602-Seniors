## ADDED Requirements

### Requirement: GameScene exposes getCombatSystem() accessor
The system SHALL add a `_combatSystem: CombatSystem | null` field and `getCombatSystem(): CombatSystem | null` accessor to `GameScene`. It returns the current CombatSystem instance or `null` before the scene is initialised. References: FR-CS-03, NFR-CS-01.

#### Scenario: getCombatSystem returns instance after create
- **WHEN** `GameScene.create()` completes
- **THEN** `gameScene.getCombatSystem()` returns a non-null `CombatSystem`

#### Scenario: getCombatSystem returns null before create
- **WHEN** `GameScene` is constructed but `create()` has not yet run
- **THEN** `gameScene.getCombatSystem()` returns `null`

### Requirement: CombatSystem is registered in the fixed-update loop
The system SHALL call `CombatSystem.fixedUpdate()` every fixed-timestep tick by registering it with `GameScene.registerFixedUpdate` in `GameScene.create()`. References: NFR-CS-01.

#### Scenario: CombatSystem.fixedUpdate called each tick
- **WHEN** a fixed-update tick runs in GameScene
- **THEN** CombatSystem.fixedUpdate() is called once
