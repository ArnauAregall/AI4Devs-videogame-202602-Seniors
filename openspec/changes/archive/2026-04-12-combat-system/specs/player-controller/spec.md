## ADDED Requirements

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
