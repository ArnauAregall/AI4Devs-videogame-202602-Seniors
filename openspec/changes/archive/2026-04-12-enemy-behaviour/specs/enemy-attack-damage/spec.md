## ADDED Requirements

### Requirement: PlayerController exposes applyHit
`PlayerController` SHALL expose a method `applyHit(event: HitEvent): void` that calls `this.takeDamage(event.damage)` and applies `event.knockbackX` / `event.knockbackY` as body velocity, then triggers the player's Hurt state. If the player is invincible, the method is a no-op. References: FR-EB-14, FR-PL-15.

#### Scenario: Damage applied when not invincible
- **WHEN** `applyHit` is called with damage 10 and player hp is 80
- **THEN** player hp is 70 after the call

#### Scenario: No damage when invincible
- **WHEN** player has invincibility frames remaining and `applyHit` is called
- **THEN** player hp is unchanged

#### Scenario: Knockback velocity applied
- **WHEN** `applyHit` is called with knockbackX 50 facing right
- **THEN** sprite velocity x is set to 50

### Requirement: GameScene bridges enemy hits to player
`GameScene` SHALL register an `onHit` callback that, when a `HitEvent` with `teamTag === 'enemy'` and `targetId === 'player'` is dispatched, calls `this._player.applyHit(event)`. References: FR-EB-14.

#### Scenario: Player takes damage when enemy hitbox overlaps player hurtbox
- **WHEN** `CombatSystem.fixedUpdate()` detects overlap between an enemy hitbox and the player hurtbox
- **THEN** `player.applyHit` is called with the resolved HitEvent

#### Scenario: Player combo counter not incremented on enemy hit
- **WHEN** a `HitEvent` with `teamTag === 'enemy'` is dispatched
- **THEN** `_comboCount` is NOT incremented

### Requirement: Enemy hitbox active only during attack active frames
Each archetype controller SHALL activate its hitbox no earlier than `ATTACK_STARTUP_FRAMES` ticks into the Attack state and SHALL deactivate it no later than `ATTACK_ACTIVE_TICKS` ticks after activation. The hitbox MUST be deactivated on `_onExitAttack()`. References: FR-EB-12, FR-EB-15.

#### Scenario: Hitbox not active before startup frames elapse
- **WHEN** enemy enters Attack state and attackTimer < BRAWLER_ATTACK_STARTUP_FRAMES
- **THEN** no hitbox is registered in CombatSystem

#### Scenario: Hitbox active during active window
- **WHEN** attackTimer equals BRAWLER_ATTACK_STARTUP_FRAMES
- **THEN** a hitbox is registered in CombatSystem

#### Scenario: Hitbox deactivated after active window
- **WHEN** attackTimer reaches BRAWLER_ATTACK_STARTUP_FRAMES + BRAWLER_ATTACK_ACTIVE_TICKS
- **THEN** the hitbox is removed from CombatSystem

#### Scenario: Hitbox removed on attack exit
- **WHEN** `_onExitAttack` is called while hitbox is active
- **THEN** the hitbox is removed from CombatSystem

### Requirement: Attack cooldown prevents re-entry
After the Attack state completes (`_finishAttack()`), the enemy SHALL NOT re-enter Attack state until `ATTACK_COOLDOWN_TICKS` ticks have elapsed. The cooldown is enforced inside `_tickAggro()` by comparing `_stateTimer` to the cooldown constant. References: FR-EB-13, FR-EB-15.

#### Scenario: No immediate re-attack after cooldown
- **WHEN** enemy exits Attack state and distance to player is still within attack range
- **THEN** enemy re-enters Attack state only after `ATTACK_COOLDOWN_TICKS` ticks in Aggro state
