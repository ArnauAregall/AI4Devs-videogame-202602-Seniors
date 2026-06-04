## MODIFIED Requirements

### Requirement: FR-DP-03 Destruction animation and despawn
When a prop's HP reaches zero the `DestructibleProp` SHALL play a destruction spritesheet animation (multi-frame sequence). The prop's hurtbox SHALL become inactive immediately when destruction begins. The physics body (hurtbox rect) SHALL be removed only after the final animation frame completes. On animation complete the sprite is destroyed.

#### Scenario: Destruction animation plays on final hit
- **WHEN** prop HP drops to 0
- **THEN** the sprite plays the destruction animation key (e.g. `'prop-barrel-destroy'`) as a frame sequence

#### Scenario: Hurtbox inactive during destruction animation
- **WHEN** the destruction animation is playing
- **THEN** `hurtboxRect` returns a zero-size rect `{ x: 0, y: 0, w: 0, h: 0 }` and no hit registration occurs

#### Scenario: Sprite destroyed after final animation frame
- **WHEN** the destruction animation's final frame completes
- **THEN** the sprite game object is destroyed and removed from the scene

#### Scenario: No collision after full destruction
- **WHEN** the prop is fully destroyed and another entity moves through its former position
- **THEN** no overlap or collision is detected

## ADDED Requirements

### Requirement: FR-DP-05 Dumpster subtype
The stage SHALL support a `dumpster` destructible prop subtype. It uses the same `DestructibleProp` class with `type: 'dumpster'` in `PropDef`. HP is defined by `GameConfig.PROP_DUMPSTER_HP`.

#### Scenario: Dumpster prop created from data
- **WHEN** `new DestructibleProp(scene, propDef)` is called with `{ type: 'dumpster', ... }`
- **THEN** the sprite texture key `ASSET_KEY_PROP_BARREL` is used as placeholder (no dedicated asset)

#### Scenario: Dumpster HP comes from GameConfig
- **WHEN** a dumpster prop is instantiated
- **THEN** its HP equals `GameConfig.PROP_DUMPSTER_HP`

### Requirement: FR-DP-06 Destruction animation defers physics removal
The `DestructibleProp` SHALL NOT remove its hurtbox or destroy its sprite until the destruction animation's `animationcomplete` event fires. The visual must never pop out abruptly mid-animation.

#### Scenario: Sprite visible throughout animation
- **WHEN** the destruction animation is playing (frames 0 through N)
- **THEN** the sprite remains visible and positioned at the prop's screen location on every frame

#### Scenario: Destroy occurs on animationcomplete event
- **WHEN** the `animationcomplete` event fires for the destruction animation
- **THEN** particle emission is triggered and the sprite is destroyed in the same tick
