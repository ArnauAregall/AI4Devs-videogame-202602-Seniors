## ADDED Requirements

### Requirement: EnemyHealthBar class
A standalone class `EnemyHealthBar` SHALL exist in `finalfight-AAA/src/enemy/EnemyHealthBar.ts`. It SHALL own a `Phaser.GameObjects.Graphics` object. It exposes `update(hp: number, maxHp: number, x: number, y: number): void` and `destroy(): void`. All dimensional and colour constants (bar width, height, vertical offset, fill colour, background colour) SHALL be exported named constants in the same file. References: FR-EB-20, FR-EB-25, FR-EB-27.

#### Scenario: Bar width proportional to hp fraction
- **WHEN** `update(40, 80, 100, 50)` is called (50% hp)
- **THEN** the fill rectangle drawn has width equal to `HP_BAR_WIDTH * 0.5`

#### Scenario: Full bar at max hp
- **WHEN** `update(80, 80, 100, 50)` is called (100% hp)
- **THEN** the fill rectangle drawn has width equal to `HP_BAR_WIDTH`

#### Scenario: Empty bar at zero hp
- **WHEN** `update(0, 80, 100, 50)` is called (0% hp)
- **THEN** the fill rectangle drawn has width of 0

### Requirement: Health bar follows enemy sprite
`EnemyController.fixedUpdate()` SHALL call `_healthBar.update(this._hp, this._maxHp, this._sprite.x, this._sprite.y)` on every tick, ensuring the bar position is always centred above the sprite. The bar's top-left y offset SHALL be `sprite.y - ENEMY_BODY_HEIGHT - HP_BAR_OFFSET_Y`. References: FR-EB-23, FR-EB-21.

#### Scenario: Bar tracks horizontal position
- **WHEN** sprite x changes to 200
- **THEN** `update` is called with x=200 in the same fixedUpdate tick

### Requirement: Health bar depth above enemy sprite
`EnemyHealthBar` SHALL set its Graphics object depth to `GameConfig.ENTITY_DEPTH + 1` so it renders above the enemy sprite and ground-level stage elements. References: FR-EB-24.

#### Scenario: Bar depth is higher than enemy sprite depth
- **WHEN** EnemyHealthBar is constructed
- **THEN** `graphics.setDepth` is called with a value greater than `GameConfig.ENTITY_DEPTH`

### Requirement: Health bar created and destroyed with enemy
`EnemyController` constructor SHALL create an `EnemyHealthBar`. `EnemyController.destroy()` SHALL call `_healthBar.destroy()`. References: FR-EB-22.

#### Scenario: Health bar destroyed on enemy destroy
- **WHEN** `enemyController.destroy()` is called
- **THEN** `_healthBar.destroy()` is called exactly once

### Requirement: Health bar removed when Death state begins
`EnemyController._onEnterState(EnemyState.Death)` SHALL call `this._healthBar.destroy()` so the bar disappears at the moment the Death animation begins, not after the linger delay. References: FR-EB-22.

#### Scenario: Bar absent during death animation
- **WHEN** enemy transitions to Death state
- **THEN** `_healthBar.destroy()` is called before any linger-frame counting begins

### Requirement: Boss excluded from per-enemy health bar
`BossController` SHALL pass `showHealthBar: false` in its construction config, and `EnemyController` SHALL skip `EnemyHealthBar` creation when `showHealthBar` is false. References: FR-EB-26.

#### Scenario: Boss has no EnemyHealthBar
- **WHEN** a BossController is constructed
- **THEN** `_healthBar` is null and no Graphics object is created for it

#### Scenario: Non-boss enemies have EnemyHealthBar
- **WHEN** a BrawlerController is constructed
- **THEN** `_healthBar` is a non-null EnemyHealthBar instance

### Requirement: Distinct health bar colour from player
The `HP_BAR_FILL_COLOR` constant in `EnemyHealthBar.ts` SHALL be a different hex value than the player health bar fill colour defined in the HUD. Both SHALL be named constants. References: FR-EB-27.

#### Scenario: Enemy and player bar colours differ
- **WHEN** reading `HP_BAR_FILL_COLOR` from EnemyHealthBar and `HUD_HP_FILL_COLOR` from HUD config
- **THEN** the two values are not equal
