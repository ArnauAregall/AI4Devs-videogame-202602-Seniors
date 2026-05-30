## MODIFIED Requirements

### Requirement: HudScene wires events from GameScene
On `create()`, `HudScene` SHALL obtain the `GameScene` event emitter and register listeners for all `GameEvents` HUD events defined in the design. Listeners SHALL update the appropriate component.

#### Scenario: PLAYER_HEALTH_CHANGED updates health bar
- **WHEN** GameScene emits `PLAYER_HEALTH_CHANGED` with `{ current: 50, max: 100 }`
- **THEN** the health bar displays at 50% fill

#### Scenario: Initial state read from GameScene
- **WHEN** `HudScene.create()` completes
- **THEN** the health bar reflects the player's current health without requiring a change event
