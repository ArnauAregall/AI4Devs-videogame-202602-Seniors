# player-controller Specification

## Purpose
TBD - created by archiving change player. Update Purpose after archive.
## Requirements
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

### Requirement: PlayerController registers hitboxes with CombatSystem
The system SHALL call `CombatSystem.registerHitbox()` with the correct rect, team tag, damage, knockback, and hit-stun values when entering each attack state. It MUST call `CombatSystem.removeHitbox()` when leaving the attack state. References: FR-CS-01, FR-CS-04, FR-CS-06, FR-CS-13, FR-CS-16.

#### Scenario: Entering LightAttack registers hitbox
- **WHEN** the player enters the LightAttack state
- **THEN** CombatSystem.registerHitbox is called with team='player' and the jab/kick constants

#### Scenario: Leaving LightAttack removes hitbox
- **WHEN** the player exits the LightAttack state
- **THEN** CombatSystem.removeHitbox is called for the attack hitbox id

#### Scenario: Special attack registers AoE hitbox
- **WHEN** the player enters the SpecialAttack state
- **THEN** CombatSystem.registerHitbox is called with isAoe=true and PLAYER_SPECIAL_HITBOX dimensions

### Requirement: PlayerController registers a hurtbox with CombatSystem
The system SHALL call `CombatSystem.registerHurtbox()` during `GameScene.create()` with the player's hurtbox rect and team='player'. It MUST call `CombatSystem.removeHurtbox()` in `PlayerController.destroy()`. References: FR-CS-02.

#### Scenario: Player hurtbox registered at creation
- **WHEN** PlayerController is created and CombatSystem is available
- **THEN** a hurtbox with team='player' is registered in the CombatSystem

#### Scenario: Player hurtbox removed on destroy
- **WHEN** PlayerController.destroy() is called
- **THEN** CombatSystem.removeHurtbox is called for the player hurtbox id

### Requirement: Grab attack uses proximity check
The system SHALL route the player grab action to `CombatSystem.tryGrab()` instead of registering a standard hitbox. When the grab succeeds the player is marked invincible for `GRAB_INVINCIBILITY_FRAMES`. References: FR-CS-15, FR-CS-20.

#### Scenario: Grab succeeds with enemy in range
- **WHEN** the player enters Grab state and tryGrab returns a HitEvent
- **THEN** the player is set invincible and the hit event is dispatched

#### Scenario: Grab fails with no enemy in range
- **WHEN** the player enters Grab state and tryGrab returns null
- **THEN** no hit event is dispatched and no invincibility is granted

