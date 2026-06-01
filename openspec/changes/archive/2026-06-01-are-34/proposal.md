## Why

Players need immediate, at-a-glance visual feedback about their current health during gameplay. A colour-coded health bar on the fixed HUD overlay lets players judge their situation instantly — green for healthy, yellow for moderate, red for critical — without reading numbers or pausing.

## What Changes

- The HUD displays a player health bar on the fixed overlay layer, showing health as a proportion of the 100 HP maximum.
- The bar fill colour changes based on named threshold constants: green above the medium threshold, yellow between medium and low, red at or below low.
- The bar width updates within the same render frame when damage is received (no visible lag).
- Colour thresholds are defined as named constants in a dedicated config file so designers can tune values without modifying business logic.

## Capabilities

### New Capabilities

### Modified Capabilities
- `hud-health-bar`: Add explicit acceptance criteria for colour thresholds as named constants and same-frame update guarantee on damage events.

## Impact

- `finalfight-AAA/src/hud/HudConfig.ts` — threshold constants already defined here; this change formalises their contract.
- `finalfight-AAA/src/hud/HealthBar.ts` — rendering logic that consumes thresholds and redraws on update.
- `finalfight-AAA/src/hud/HudScene.ts` — wires `PLAYER_HEALTH_CHANGED` event to HealthBar.update().
- No new dependencies or breaking changes.
