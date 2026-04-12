## MODIFIED Requirements

### Requirement: GameScene exposes getEnemyManager() accessor
`GameScene` SHALL add a `getEnemyManager(): EnemyManager | null` method that returns the active `EnemyManager` instance, or `null` before it is created. `EnemyManager.fixedUpdate()` is registered with `registerFixedUpdate` in `GameScene.create()` immediately after `CombatSystem` registration. References: FR-EA-18.

#### Scenario: getEnemyManager returns instance after create
- **WHEN** GameScene.create() completes
- **THEN** getEnemyManager() returns a non-null EnemyManager

#### Scenario: EnemyManager fixed-update is called each tick
- **WHEN** a fixed-update step runs
- **THEN** EnemyManager.fixedUpdate() is invoked
