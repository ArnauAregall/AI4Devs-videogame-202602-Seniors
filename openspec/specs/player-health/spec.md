# player-health Specification

## Purpose
TBD - created by archiving change player. Update Purpose after archive.
## Requirements
### Requirement: Player maximum health is 100
The system SHALL initialise the player with `hp = 100` and `maxHp = 100`. These values SHALL be read from `GameConfig.PLAYER_MAX_HP`.

#### Scenario: Player starts at full health
- **WHEN** a new `PlayerController` is created
- **THEN** `player.hp === GameConfig.PLAYER_MAX_HP`

### Requirement: Player takes damage when hit and not invincible
The system SHALL reduce `player.hp` by `attackerDamage` when `PlayerController.takeDamage(amount)` is called and `iFramesRemaining === 0`.

#### Scenario: Damage reduces HP
- **WHEN** `takeDamage(20)` is called and `iFramesRemaining === 0`
- **THEN** `player.hp` decreases by 20

#### Scenario: Damage is ignored during iFrames
- **WHEN** `takeDamage(20)` is called and `iFramesRemaining > 0`
- **THEN** `player.hp` is unchanged

### Requirement: Player starts with 3 lives
The system SHALL initialise the player with `lives = GameConfig.PLAYER_LIVES` (default 3).

#### Scenario: Initial lives count
- **WHEN** a new `PlayerController` is created
- **THEN** `player.lives === 3`

### Requirement: Losing all health costs one life and triggers respawn
The system SHALL trigger `PlayerController.onDeath()` when `hp` reaches zero or below. `onDeath()` decrements `lives` by 1, restores `hp` to `maxHp`, and grants `GameConfig.RESPAWN_IFRAMES` invincibility ticks.

#### Scenario: Death decrements lives
- **WHEN** `hp` reaches 0 and `lives > 0`
- **THEN** `lives` decrements by 1 and `hp` is restored to `maxHp`

#### Scenario: Respawn grants iFrames
- **WHEN** the player respawns after death
- **THEN** `iFramesRemaining === GameConfig.RESPAWN_IFRAMES`

### Requirement: Last life lost triggers Game Over
The system SHALL call `GameScene.triggerGameOver()` when `onDeath()` is called and `lives` is already 0.

#### Scenario: Game over on last life lost
- **WHEN** `hp` reaches 0 and `lives === 0`
- **THEN** `GameScene.triggerGameOver()` is called

### Requirement: GetUp state grants invincibility frames
The system SHALL set `iFramesRemaining = GameConfig.GETUP_IFRAMES` when entering the `GetUp` state.

#### Scenario: GetUp grants iFrames
- **WHEN** the state machine enters `GetUp`
- **THEN** `iFramesRemaining === GameConfig.GETUP_IFRAMES`

