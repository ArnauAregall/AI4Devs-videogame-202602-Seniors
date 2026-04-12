## ADDED Requirements

### Requirement: Boss registers Phaser animations
`BossController` constructor SHALL call `registerPunkAnims(scene)` and pass a `showHealthBar: false` flag so no `EnemyHealthBar` is created for the boss. It SHALL pass an `animKeys` map using punk animation keys (placeholder until boss sprites are sourced). References: FR-EB-26.

#### Scenario: Boss construction passes showHealthBar false
- **WHEN** BossController is constructed
- **THEN** `EnemyController` receives `showHealthBar: false` in its config

#### Scenario: No Graphics object created for boss health bar
- **WHEN** BossController is constructed
- **THEN** no `EnemyHealthBar` instance is created for this enemy
