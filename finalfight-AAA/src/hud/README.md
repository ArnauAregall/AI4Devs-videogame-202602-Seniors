# HUD Module — Developer & Designer Guide

## Overview

The `src/hud/` module implements the Heads-Up Display for the Final Fight Clone.
All HUD elements are rendered on a **fixed overlay layer** (`HudScene`) that never
scrolls with the game world, guaranteeing permanent on-screen visibility during
gameplay.

## Health Bar System

### Representation

The player's health is shown as a horizontal filled bar. The fill width is
proportional to `currentHP / maxHP` (100 HP maximum by default). A full bar
occupies 100 px; an empty bar shows only the dark background.

### Colour Thresholds

The bar transitions through three colours as HP decreases:

| Condition | Colour | Meaning |
|-----------|--------|---------|
| HP > 50 % | Green (`0x22cc44`) | Healthy |
| HP > 25 % and ≤ 50 % | Yellow (`0xffcc00`) | Caution |
| HP ≤ 25 % | Red (`0xff2222`) | Critical |

Thresholds are configured in **`HudConfig.ts`** via:

- `HUD_HEALTH_YELLOW_THRESHOLD` — fraction (0–1) at or below which the bar turns yellow.
- `HUD_HEALTH_RED_THRESHOLD` — fraction (0–1) at or below which the bar turns red.

### Synchronous Update Contract

When damage is applied and the `PLAYER_HEALTH_CHANGED` event fires, the health
bar recalculates both its **width** and **fill colour** within the **same render
frame**. There is no tween, delay, or deferred update — the visual state always
matches the authoritative game state at the instant the frame is presented.

## Tuning Thresholds (For Designers)

To adjust when the bar changes colour:

1. Open `src/hud/HudConfig.ts`.
2. Change `HUD_HEALTH_YELLOW_THRESHOLD` and/or `HUD_HEALTH_RED_THRESHOLD`.
   - Values are fractions of max HP: `0.5` = 50 %, `0.33` = 33 %, etc.
3. Save and rebuild. No other files need modification.

These constants are the **single source of truth** for colour transitions. The
health bar component reads them at draw time; no business logic changes are
required.

## File Map

| File | Responsibility |
|------|---------------|
| `HudConfig.ts` | All layout, colour, font, and threshold constants |
| `HudScene.ts` | Fixed-overlay scene; instantiates components, wires events |
| `HealthBar.ts` | Player health bar rendering and colour logic |
| `BossHealthBar.ts` | Boss-specific health bar (bottom of screen) |
| `ScoreDisplay.ts` | Right-aligned score counter |
| `LivesDisplay.ts` | Remaining lives indicator |
| `ComboCounter.ts` | Active combo hit counter |
| `TimerDisplay.ts` | Stage countdown timer |
| `SpecialCooldownDisplay.ts` | Special attack cooldown indicator |
| `LeaderboardStore.ts` | High-score persistence (localStorage) |
