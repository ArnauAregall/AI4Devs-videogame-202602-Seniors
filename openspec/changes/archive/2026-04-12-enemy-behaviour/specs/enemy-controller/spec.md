## ADDED Requirements

### Requirement: Animation key map in EnemyControllerConfig
`EnemyControllerConfig` SHALL include `animKeys: Readonly<Record<EnemyState, string>>` and `showHealthBar?: boolean` (default true). References: FR-EB-01 through FR-EB-05.

#### Scenario: Config accepts animKeys
- **WHEN** EnemyControllerConfig is constructed with a valid animKeys map
- **THEN** no TypeScript compile error is produced

### Requirement: State-transition animation playback
`EnemyController._onEnterState(state)` SHALL call `this._sprite.play(this._animKeys[state], true)` for every state. References: FR-EB-06.

#### Scenario: Correct key played for Hurt state
- **WHEN** state transitions to Hurt
- **THEN** `sprite.play` is called with `animKeys[EnemyState.Hurt]`

#### Scenario: Correct key played for Death state
- **WHEN** state transitions to Death
- **THEN** `sprite.play` is called with `animKeys[EnemyState.Death]`

### Requirement: Per-frame facing-direction flip
`EnemyController.fixedUpdate()` SHALL call `this._sprite.setFlipX(!this._facingRight)` on every tick. References: FR-EB-07.

#### Scenario: Flip updated mid-Aggro when direction changes
- **WHEN** enemy is in Aggro state and _facingRight changes from true to false
- **THEN** `sprite.setFlipX(true)` is called on the next fixedUpdate tick

### Requirement: EnemyHealthBar lifecycle
`EnemyController` constructor SHALL create `new EnemyHealthBar(scene)` when `showHealthBar !== false`. `_onEnterState(Death)` SHALL call `_healthBar?.destroy()`. `destroy()` SHALL call `_healthBar?.destroy()`. `fixedUpdate()` SHALL call `_healthBar?.update(hp, maxHp, x, y)` every tick. References: FR-EB-20 through FR-EB-24.

#### Scenario: Health bar updated every tick
- **WHEN** fixedUpdate is called while enemy is alive
- **THEN** `_healthBar.update` is called with current hp and sprite position
