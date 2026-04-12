# Player — Functional Requirements

## Overview

The player subsystem defines all controllable character behaviour in the Final Fight clone, including movement states, attack actions, health management, and input handling for both keyboard and gamepad. It is the primary interface between player intent and the combat and stage systems.

## Functional Requirements

FR-PL-01: The player character must have an Idle state that plays when no movement or action input is held.
FR-PL-02: The player character must have a Walk state that plays when a directional input (left, right, up, or down) is held and no attack is active.
FR-PL-03: The player character must have a Jump state that begins when the jump input is pressed and ends when the character lands on the ground plane.
FR-PL-04: The player character must have a Light Attack state triggered by the light attack input, playing a short attack animation and activating the hitbox for the duration of the active frames.
FR-PL-05: The player character must have a Heavy Attack state triggered by the heavy attack input, playing a longer attack animation with a wider hitbox than the light attack.
FR-PL-06: The player character must have a Jump Attack state that can be triggered while in the Jump state, replacing the in-air idle animation with an attack animation.
FR-PL-07: The player character must have a Grab state triggered by pressing the grab input when an enemy is within grab range, initiating a throw sequence.
FR-PL-08: The player character must have a Hurt state that plays when the character receives a hit while not in an invincible state, interrupting any current non-super action.
FR-PL-09: The player character must have a Knockdown state that plays when the character's knockback distance exceeds a defined threshold or when a specific enemy attack triggers it.
FR-PL-10: The player character must have a Get-Up state that plays automatically after Knockdown completes, granting a brief period of invincibility frames.
FR-PL-11: The player character must have a Special Attack state triggered by a defined input combination, consuming a portion of the player's health in exchange for a screen-clearing area attack.
FR-PL-12: The default keyboard input mapping must be: Arrow keys or WASD for movement, Z or J for light attack, X or K for heavy attack, C or L for grab, Space for jump, and Enter for special attack.
FR-PL-13: The game must support gamepad input using the standard layout: left stick or d-pad for movement, A/Cross for jump, X/Square for light attack, Y/Triangle for heavy attack, B/Circle for grab, and LB/L1 for special attack.
FR-PL-14: The player character must have a defined maximum health points value.
FR-PL-15: The player's health must decrease by the attacker's damage value when hit and not invincible.
FR-PL-16: The player must have a defined number of lives; losing all health causes one life to be lost and the character to respawn at the current position with full health.
FR-PL-17: When the last life is lost, the game must transition to the Game Over state.
FR-PL-18: The player must have invincibility frames during the Get-Up state and for a configurable duration after respawning; during these frames all incoming damage is ignored.
FR-PL-19: The player character must be unable to walk off the top or bottom boundaries of the stage's walkable ground plane.
FR-PL-20: The player's horizontal movement speed must be lower than the maximum scroll speed of the stage to prevent the player from outrunning the camera.
FR-PL-21: In two-player mode, a second player character must be independently controllable using a separate input device (gamepad 2 or a second keyboard mapping).

## Non-Functional Requirements

NFR-PL-01: State transitions must respond to input within one frame (under 16 ms).
NFR-PL-02: The player animation system must support at least 12 distinct animation clips without dropping below 60 fps.
NFR-PL-03: Input polling must occur every fixed-timestep update, not every render frame, to maintain deterministic behaviour.
NFR-PL-04: Gamepad connection and disconnection must be detected and handled without crashing the game.

## Open Questions

- How many playable characters are there at launch? Is there a character select screen?
- What is the exact health point maximum for the player (e.g. 100, 128, 200)?
- What is the default number of lives?
- Does the Special Attack have a cooldown or is it purely health-gated?
- Should two-player mode support split keyboard (e.g. player 1: WASD+keys, player 2: arrows+keys)?
- Is there a combo system where specific input sequences unlock additional attack states beyond light/heavy/jump attack?
