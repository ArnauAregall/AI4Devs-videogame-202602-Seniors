# Game Loop — Functional Requirements

## Overview

The game loop governs the timing, update cadence, and scene lifecycle of the Final Fight clone. It ensures all game objects are updated at a consistent rate regardless of rendering frame rate, and manages the transitions between the game's major states — from initial boot through gameplay, pause, and game over.

## Functional Requirements

FR-GL-01: The game must target a rendering frame rate of 60 frames per second.
FR-GL-02: The game must use a fixed-timestep update loop so that physics and game logic advance at a constant rate independent of the actual rendering frame rate.
FR-GL-03: When the actual frame rate drops below 30 fps, the game must continue updating game logic at the fixed rate by running multiple update steps per rendered frame (up to a defined maximum step count) rather than skipping updates.
FR-GL-04: The game must define a Boot scene that loads the minimum assets required to display a loading screen, then transitions to the Preload scene.
FR-GL-05: The Preload scene must display a visible loading progress indicator and load all remaining game assets before transitioning to the Main Menu scene.
FR-GL-06: The game must define a Game scene that is the primary gameplay context, containing the player, enemies, stage, HUD, and all interactive elements.
FR-GL-07: The game must support a Pause state that suspends all game object updates and physics simulation while keeping the HUD and pause menu visible and interactive.
FR-GL-08: Pausing must be triggered by a dedicated pause input action and must not be possible during cutscenes, transitions, or while the game-over state is active.
FR-GL-09: Resuming from Pause must restore all game objects to the exact state they were in at the moment of pausing.
FR-GL-10: The game must define a Game Over state that is triggered when the player's lives reach zero, halts gameplay, and displays the game over screen.
FR-GL-11: The game must define a Stage Clear state that is triggered when the stage clear condition is met, halts enemy spawning, plays the stage clear sequence, and then transitions to the next stage or end screen.
FR-GL-12: The game configuration must specify the canvas dimensions (width and height in pixels) as named constants, not hardcoded values.
FR-GL-13: The game configuration must enable Arcade Physics with a gravity value of zero by default, since beat-'em-up movement is not gravity-driven.
FR-GL-14: The game must support running in both a fixed-size canvas and a responsive canvas that scales to fit the browser window while maintaining the original aspect ratio.

## Non-Functional Requirements

NFR-GL-01: The fixed-timestep update step must complete in under 16 ms to avoid frame drops at 60 fps on mid-range hardware.
NFR-GL-02: Scene transitions must complete within one rendered frame — no visible flicker or blank frame between scenes.
NFR-GL-03: The pause state must activate within one frame of the pause input being detected.
NFR-GL-04: The game loop must not accumulate time debt — if the maximum update steps per frame is exceeded, surplus time must be discarded rather than carried over.

## Open Questions

- What is the maximum number of fixed-timestep update steps allowed per rendered frame before surplus time is discarded?
- Should the game support a variable target frame rate (e.g. 30 fps for low-end devices) or always target 60 fps?
- Should the Main Menu be a separate scene or part of the Boot/Preload flow?
- Is there a Stage Select screen between stages, or does the game transition directly?
