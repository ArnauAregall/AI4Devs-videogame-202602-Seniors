## ADDED Requirements

### Requirement: PlayerController registers with GameScene fixed-timestep hook
The system SHALL register `PlayerController.fixedUpdate` with `GameScene.registerFixedUpdate` during `GameScene.create()`. It MUST unregister via `GameScene.unregisterFixedUpdate` when the player is destroyed.

#### Scenario: Fixed-update callback is invoked each tick
- **WHEN** `GameScene.update()` is called and the player is active
- **THEN** `PlayerController.fixedUpdate(FIXED_DELTA_MS)` is called once per fixed tick

#### Scenario: Callback is removed on destroy
- **WHEN** `PlayerController.destroy()` is called
- **THEN** `GameScene.unregisterFixedUpdate` is called with the player's callback reference

### Requirement: PlayerController plays the correct animation for each state
The system SHALL play the Phaser animation keyed to the current `PlayerState` whenever the state changes. Each state maps to exactly one animation key defined in `AssetKeys`.

#### Scenario: Entering Idle plays idle animation
- **WHEN** the state machine enters `Idle`
- **THEN** `this.sprite.play(ASSET_KEY_PLAYER_IDLE, true)` is called

#### Scenario: Entering Walk plays walk animation
- **WHEN** the state machine enters `Walk`
- **THEN** `this.sprite.play(ASSET_KEY_PLAYER_WALK, true)` is called

### Requirement: PlayerController spawns and despawns hitboxes per attack state
The system SHALL add a `Phaser.GameObjects.Rectangle` to the `playerHitboxGroup` physics group when entering an attack state (LightAttack, HeavyAttack, JumpAttack, Grab, SpecialAttack). The hitbox MUST be destroyed when the attack state exits.

#### Scenario: Hitbox exists during LightAttack
- **WHEN** the player is in `LightAttack`
- **THEN** exactly one hitbox exists in `playerHitboxGroup`

#### Scenario: Hitbox is removed on state exit
- **WHEN** the player transitions out of `LightAttack`
- **THEN** `playerHitboxGroup` contains no hitboxes for the player

### Requirement: PlayerController flips sprite based on facing direction
The system SHALL set `sprite.setFlipX(true)` when the player moves left and `setFlipX(false)` when moving right. The last facing direction is preserved while stationary.

#### Scenario: Moving left flips sprite
- **WHEN** the player enters `Walk` state with leftward input
- **THEN** `sprite.flipX` is `true`

#### Scenario: Moving right restores normal orientation
- **WHEN** the player enters `Walk` state with rightward input
- **THEN** `sprite.flipX` is `false`
