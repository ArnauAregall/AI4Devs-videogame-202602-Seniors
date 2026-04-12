## ADDED Requirements

### Requirement: FR-PB-01 Minimum three parallax layers
The ParallaxBackground SHALL render at least three `TileSprite` layers for each stage. Each layer SHALL have a distinct horizontal scroll speed factor relative to the camera delta, with the rearmost layer having the smallest factor.

#### Scenario: Layers render at distinct speeds
- **WHEN** cameraX advances by N pixels in one fixed tick
- **THEN** each layer's `tilePositionX` increases by `N × speedFactor`, where each layer has a unique `speedFactor` in range (0, 1]

#### Scenario: Rearmost layer scrolls slowest
- **WHEN** cameraX advances
- **THEN** layer at depth index 0 has the smallest speedFactor among all layers

### Requirement: FR-PB-02 Seamless tiling
Each layer SHALL tile seamlessly with no visible seam. Layers SHALL be implemented as `TileSprite` objects whose width equals `CANVAS_WIDTH` and `tilePositionX` is updated each tick.

#### Scenario: No seam at tile boundary
- **WHEN** `tilePositionX` exceeds the layer's natural width
- **THEN** the texture wraps without any visible gap or repeated border

### Requirement: FR-PB-03 Fixed-timestep update
ParallaxBackground SHALL update layer positions only inside the fixed-timestep callback registered via `scene.registerFixedUpdate`, not in `Phaser.Scene.update`.

#### Scenario: Update called in fixed tick
- **WHEN** `fixedUpdate(dt)` is called
- **THEN** each layer's `tilePositionX` is updated proportional to `cameraX` delta since last tick

### Requirement: NFR-PB-01 No tearing at 60 fps
Layer updates SHALL be applied atomically within a single fixed tick so that all layers are in sync at render time; no layer is updated mid-frame.

#### Scenario: All layers updated before render
- **WHEN** `fixedUpdate` returns
- **THEN** all layer `tilePositionX` values reflect the same `cameraX` snapshot
