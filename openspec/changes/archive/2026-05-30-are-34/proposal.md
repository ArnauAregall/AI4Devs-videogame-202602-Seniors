## Why

The player health bar is the primary feedback mechanism for combat — without it, players cannot assess risk or react to damage. The current HUD lacks a visual health bar with colour-coded thresholds. This change implements a fixed overlay health bar that reflects the player's current HP as a proportion of max, using named colour constants (green/yellow/red) that change at configurable thresholds.

## What Changes

- Implement `HealthBar` class that renders a rectangular bar whose filled width is proportional to `current / max` HP
- Health bar fill colour changes at named threshold constants:
  - `HUD_HEALTH_GREEN` when fraction > `HUD_HEALTH_YELLOW_THRESHOLD`
  - `HUD_HEALTH_YELLOW` when fraction > `HUD_HEALTH_RED_THRESHOLD` and ≤ yellow threshold
  - `HUD_HEALTH_RED` when fraction ≤ `HUD_HEALTH_RED_THRESHOLD`
- Wire `HealthBar` to `HudScene` via `PLAYER_HEALTH_CHANGED` event for same-frame updates
- Define all positioning, colour, and threshold constants as named exports in `HudConfig.ts`
- Health bar renders on the fixed HUD overlay layer that does not scroll with the stage camera

## Capabilities

### New Capabilities
- `hud-health-bar`: Player health bar component with colour-coded fill, renders on HUD overlay layer, updates within one frame of damage events

### Modified Capabilities
- `hud-config`: Add health bar position and dimension constants (`HUD_HEALTH_BAR_X`, `HUD_HEALTH_BAR_Y`, `HUD_HEALTH_BAR_WIDTH`, `HUD_HEALTH_BAR_HEIGHT`) alongside existing colour threshold constants
- `hud-scene`: Wire `PLAYER_HEALTH_CHANGED` event to HealthBar instance; seed initial health state from GameScene on create

## Impact

- **New files**: `src/hud/HealthBar.ts`
- **Modified files**: `src/hud/HudConfig.ts`, `src/hud/HudScene.ts`, `src/__tests__/HealthBar.test.ts`
- **No changes** to player health or combat logic — thresholds are fully contained in HudConfig
