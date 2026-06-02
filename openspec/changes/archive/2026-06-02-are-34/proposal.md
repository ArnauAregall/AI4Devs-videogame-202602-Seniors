## Why

Players need immediate, colour-coded visual feedback about their current health during gameplay. The HUD health bar must be always visible on the fixed overlay and must change colour at designer-tunable thresholds (green → yellow → red) so players can judge their situation at a glance without reading numbers.

## What Changes

- Ensure the player health bar renders on the fixed HUD overlay showing health as a proportion of 100 HP maximum
- Health bar colour transitions through green/yellow/red based on named threshold constants
- Bar width updates synchronously within the same render frame when damage is received (no animation lag)
- Colour thresholds are defined as named constants in `HudConfig.ts` so designers can tune without touching business logic

## Capabilities

### New Capabilities

(none — this feature is covered by the existing `hud-health-bar` capability)

### Modified Capabilities

- `hud-health-bar`: Verify and enforce that colour thresholds use named constants, bar updates are same-frame synchronous, and the bar is visible on the fixed overlay layer at all times during gameplay

## Impact

- `finalfight-AAA/src/hud/HealthBar.ts` — health bar rendering with colour logic
- `finalfight-AAA/src/hud/HudConfig.ts` — threshold constants (`HUD_HEALTH_YELLOW_THRESHOLD`, `HUD_HEALTH_RED_THRESHOLD`)
- `finalfight-AAA/src/hud/HudScene.ts` — HUD overlay scene that hosts the health bar
