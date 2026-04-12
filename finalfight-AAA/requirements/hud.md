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
FR-HU-15: Two-player mode is out of scope for the initial release; the HUD is designed for a single player only.
FR-HU-16: All HUD text must use a font and size that remains legible at the target canvas resolution without anti-aliasing artefacts.
FR-HU-17: The HUD must display a countdown timer showing the remaining stage time, starting at 3 minutes (180 seconds) and counting down to zero in whole seconds.
FR-HU-18: The countdown timer must change colour when 30 seconds or fewer remain, using a defined warning colour (e.g. red), to alert the player.
FR-HU-19: The player has a maximum of 3 continues per game session; the "Continue" option on the game over screen must be hidden once all continues are exhausted.
FR-HU-20: The HUD must display the Special Attack cooldown state; when the cooldown is active, a visual indicator must show the remaining cooldown time.
FR-HU-21: The combo counter must display the hit count only, not the damage total.
FR-HU-22: The pause menu must support both keyboard navigation and gamepad navigation using the same directional and confirm inputs.
FR-HU-23: The game must display a high score leaderboard screen accessible from the Main Menu and from the game over screen; it must show the top 10 scores with player name and score value.
FR-HU-24: When a player completes the game or loses their last life and achieves a score that places in the top 10, the game must prompt them to enter their name (up to 10 characters) before displaying the leaderboard.
FR-HU-25: The leaderboard data must be persisted in the browser's local storage so scores survive page reloads.

## Non-Functional Requirements

NFR-HU-01: HUD rendering must not consume more than 1 ms of the per-frame update budget.
NFR-HU-02: The game over and stage clear screens must be reachable from every gameplay state without requiring a scene reload.
NFR-HU-03: All HUD colour values, font sizes, and layout positions must be defined as named constants to facilitate visual tuning without code changes.
NFR-HU-04: The HUD must remain fully legible (no overlapping elements) at both the minimum supported canvas width and the maximum supported canvas width.

