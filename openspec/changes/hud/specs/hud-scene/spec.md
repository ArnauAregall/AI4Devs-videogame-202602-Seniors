## ADDED Requirements

### Requirement: HudScene is a fixed overlay Phaser Scene
`HudScene` SHALL be a Phaser Scene with key `'HudScene'` that is launched by `GameScene.create()` and runs in parallel. Its camera SHALL be fixed at origin with no scroll. All HUD sub-components SHALL be created and managed within `HudScene`.

#### Scenario: HudScene launches with GameScene
- **WHEN** `GameScene.create()` completes
- **THEN** `this.scene.isActive('HudScene')` returns `true`

#### Scenario: HudScene camera does not scroll
- **WHEN** the stage camera scrolls to any x/y offset
- **THEN** all HudScene display objects remain at their original screen positions

### Requirement: HudScene wires events from GameScene
On `create()`, `HudScene` SHALL obtain the `GameScene` event emitter and register listeners for all `GameEvents` HUD events defined in the design. Listeners SHALL update the appropriate component.

#### Scenario: PLAYER_HEALTH_CHANGED updates health bar
- **WHEN** GameScene emits `PLAYER_HEALTH_CHANGED` with `{ current: 50, max: 100 }`
- **THEN** the health bar displays at 50% fill

#### Scenario: Initial state read from GameScene
- **WHEN** `HudScene.create()` completes
- **THEN** the health bar reflects the player's current health without requiring a change event

### Requirement: HudScene renders on top of all game layers
`HudScene` SHALL set its scene depth or launch order so it renders above `GameScene` and all stage layers.

#### Scenario: HUD always visible above stage
- **WHEN** any stage sprite or background layer is displayed
- **THEN** all HUD elements are drawn on top of them at all times
