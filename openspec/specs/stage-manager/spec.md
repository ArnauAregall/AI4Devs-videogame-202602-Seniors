# stage-manager Specification

## Purpose
TBD - created by archiving change stage. Update Purpose after archive.
## Requirements
### Requirement: FR-SM-01 One-way horizontal camera scroll
The StageManager SHALL advance `cameraX` rightward as the player moves forward. `cameraX` SHALL never decrease. `cameraX` SHALL be clamped to `[0, stageWidth - CANVAS_WIDTH]`.

#### Scenario: Camera advances with player
- **WHEN** the player's world X position exceeds `cameraX + CANVAS_WIDTH * 0.6`
- **THEN** `cameraX` is increased so the player stays within the right 40% of the viewport

#### Scenario: Camera does not scroll left
- **WHEN** the player moves left past the centre of the viewport
- **THEN** `cameraX` remains unchanged

#### Scenario: Camera clamps at stage right boundary
- **WHEN** `cameraX + CANVAS_WIDTH` would exceed `stageWidth`
- **THEN** `cameraX` is set to `stageWidth - CANVAS_WIDTH`

### Requirement: FR-SM-02 Scroll-trigger locking
When the camera reaches a scroll-trigger world position, the StageManager SHALL lock camera advance and activate the associated spawn zone.

#### Scenario: Camera locks at trigger
- **WHEN** `cameraX + CANVAS_WIDTH >= trigger.worldX` for an unfired trigger
- **THEN** camera advance is suspended and the spawn zone is activated

#### Scenario: Camera unlocks when zone cleared
- **WHEN** the active spawn zone emits `'zoneCleared'`
- **THEN** camera advance resumes

### Requirement: FR-SM-03 Stage-clear detection
The StageManager SHALL detect the stage-clear condition: all spawn zones cleared AND player world X ≥ stageWidth.

#### Scenario: Stage clear triggers sequence
- **WHEN** all spawn zones are cleared and the player reaches the right edge
- **THEN** StageManager emits `'stageClear'` exactly once

### Requirement: FR-SM-04 Stage-clear transition
After `'stageClear'`, the StageManager SHALL stop all movement, trigger `scene.cameras.main.fadeOut`, and on fade completion start the next stage scene or the end screen.

#### Scenario: Transition to next stage
- **WHEN** `stageClear` fires and `stageIndex < STAGE_COUNT - 1`
- **THEN** after fade-out the game scene restarts with `stageIndex + 1`

#### Scenario: Transition to end screen
- **WHEN** `stageClear` fires and `stageIndex === STAGE_COUNT - 1`
- **THEN** after fade-out the end screen scene starts

### Requirement: FR-SM-05 Boundary walls
The StageManager SHALL create two static Arcade bodies — one at world X = 0 and one at world X = stageWidth — that block player and enemy movement.

#### Scenario: Player blocked by left wall
- **WHEN** the player moves to world X ≤ 0
- **THEN** the player's X position is clamped to `PLAYER_BODY_HALF_WIDTH`

#### Scenario: Player blocked by right wall
- **WHEN** the player moves to world X ≥ stageWidth
- **THEN** the player's X position is clamped to `stageWidth - PLAYER_BODY_HALF_WIDTH`

