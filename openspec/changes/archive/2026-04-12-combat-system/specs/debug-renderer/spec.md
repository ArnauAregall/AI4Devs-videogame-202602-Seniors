## ADDED Requirements

### Requirement: Debug hitbox overlay rendering
The DebugRenderer SHALL draw red rectangles over every currently registered hitbox and green rectangles over every currently registered hurtbox during each Phaser `update()` call, but only when `GameConfig.DEBUG_HITBOXES` is `true`. References: FR-CS-17, NFR-CS-04.

#### Scenario: Hitboxes drawn in red when debug enabled
- **WHEN** DEBUG_HITBOXES is true and a hitbox is registered
- **THEN** a red outlined rectangle is drawn at the hitbox position each frame

#### Scenario: Hurtboxes drawn in green when debug enabled
- **WHEN** DEBUG_HITBOXES is true and a hurtbox is registered
- **THEN** a green outlined rectangle is drawn at the hurtbox position each frame

#### Scenario: No overlay drawn when debug disabled
- **WHEN** DEBUG_HITBOXES is false
- **THEN** no rectangles are drawn

### Requirement: Runtime toggle without reload
The DebugRenderer SHALL respond to a `setVisible(flag: boolean)` call at runtime to show or hide the overlay without destroying or recreating the Graphics object. References: NFR-CS-04.

#### Scenario: Overlay hidden at runtime
- **WHEN** setVisible(false) is called while hitboxes are active
- **THEN** the graphics object is hidden but hitbox/hurtbox data is unchanged

#### Scenario: Overlay re-shown at runtime
- **WHEN** setVisible(true) is called after being hidden
- **THEN** the graphics object becomes visible and resumes drawing
