# HUD — Functional Requirements

## Overview

The HUD (Heads-Up Display) subsystem provides the player with real-time information about game state — their health, remaining lives, current score, and boss health — while also presenting the game over, stage clear, and pause overlay screens. It must remain readable and unobtrusive throughout gameplay.

## Functional Requirements

FR-HU-01: The HUD must display a health bar for the player that shows their current health as a proportion of their maximum health at all times during gameplay.
FR-HU-02: The player health bar must update smoothly — decreasing health must be reflected in the bar within one frame of the damage event.
FR-HU-03: The player health bar must change colour as health decreases: full or near-full health displays in green, medium health in yellow, and low health in red, with the threshold values defined as constants.
FR-HU-04: The HUD must display the player's remaining lives count as a numeric value alongside an icon representing the player character.
FR-HU-05: When the player loses a life, the lives display must update immediately after the respawn sequence begins.
FR-HU-06: The HUD must display the current score as a right-aligned numeric value that updates every time points are awarded.
FR-HU-07: Score must be awarded for each enemy defeated; the point value per enemy archetype must be configurable.
FR-HU-08: When a boss enemy is active, the HUD must display a dedicated boss health bar at the bottom of the screen showing the boss's current health as a proportion of its maximum health.
FR-HU-09: The boss health bar must appear when the boss enters the scene and disappear when the boss is defeated.
FR-HU-10: The combo counter must be displayed on screen when the active combo count is two or more, and must disappear when the combo window expires.
FR-HU-11: The game over screen must display the text "GAME OVER", the player's final score, and two options: "Continue" (if continues are available) and "Quit to Main Menu".
FR-HU-12: The stage clear screen must display the text "STAGE CLEAR", the player's score for the completed stage, and a time bonus if a time limit is in use.
FR-HU-13: The pause menu must display "PAUSED", and provide options to resume, view controls, or quit to the main menu.
FR-HU-14: All HUD elements must be rendered on a fixed overlay layer that does not scroll with the stage camera.
FR-HU-15: In two-player mode, the HUD must display separate health bars and lives counters for both players simultaneously without overlapping.
FR-HU-16: All HUD text must use a font and size that remains legible at the target canvas resolution without anti-aliasing artefacts.

## Non-Functional Requirements

NFR-HU-01: HUD rendering must not consume more than 1 ms of the per-frame update budget.
NFR-HU-02: The game over and stage clear screens must be reachable from every gameplay state without requiring a scene reload.
NFR-HU-03: All HUD colour values, font sizes, and layout positions must be defined as named constants to facilitate visual tuning without code changes.
NFR-HU-04: The HUD must remain fully legible (no overlapping elements) at both the minimum supported canvas width and the maximum supported canvas width.

## Open Questions

- Is there a time limit per stage? If so, must the HUD display a countdown timer?
- Are continues limited in number, or unlimited?
- Should the combo counter display the damage total of the combo, or only the hit count?
- Is there a high score leaderboard, and if so, does the game over screen provide a score entry prompt?
- Should the pause menu support controller navigation in addition to keyboard navigation?
