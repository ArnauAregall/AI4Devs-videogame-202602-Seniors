## ADDED Requirements

### Requirement: GameScene exposes a getPlayer() accessor
The system SHALL add `getPlayer(): PlayerController | null` to `GameScene`. It returns the current player instance or `null` before the player is created.

#### Scenario: getPlayer returns the instance after create
- **WHEN** `GameScene.create()` completes
- **THEN** `gameScene.getPlayer()` returns a non-null `PlayerController`

#### Scenario: getPlayer returns null before create
- **WHEN** `GameScene` is constructed but `create()` has not yet run
- **THEN** `gameScene.getPlayer()` returns `null`
