## ADDED Requirements

### Requirement: GameScene exposes a getStageManager() accessor
The system SHALL add `_stageManager: StageManager | null` field and `getStageManager(): StageManager | null` accessor to `GameScene`. It returns the current StageManager instance or `null` before the stage is initialised.

#### Scenario: getStageManager returns instance after create
- **WHEN** `GameScene.create()` completes with a valid stage data argument
- **THEN** `gameScene.getStageManager()` returns a non-null `StageManager`

#### Scenario: getStageManager returns null before create
- **WHEN** `GameScene` is constructed but `create()` has not yet run
- **THEN** `gameScene.getStageManager()` returns `null`

### Requirement: GameScene provides an itemPickupGroup
The system SHALL create and expose a `itemPickupGroup: Phaser.GameObjects.Group` in `GameScene.create()` for use by `ItemPickup` objects.

#### Scenario: itemPickupGroup is accessible to StageManager
- **WHEN** `GameScene.create()` completes
- **THEN** `gameScene.itemPickupGroup` is a non-null Phaser Group
