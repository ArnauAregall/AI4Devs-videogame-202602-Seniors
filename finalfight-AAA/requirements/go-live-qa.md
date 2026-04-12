# Go-Live QA — Functional Requirements

## Overview

This file captures the five remaining gameplay, physics, pacing, and menu gaps
identified during end-to-end playtesting immediately before exercise delivery.
Each gap area has its own cluster of requirements. Once this file is accepted,
it will be passed to OpenSpec for specification and implementation. No existing
requirement in enemy-ai.md, combat-system.md, player.md, hud.md, or
enemy-behaviour.md covers these behaviours; this file does not duplicate any
of those FRs.

## Functional Requirements

### Gap 1 — Player-enemy physics coexistence

FR-GOLV-01: The player character and enemy characters must be able to occupy
overlapping world-space positions simultaneously; the physics engine must not
apply any automatic separation force or velocity transfer between player bodies
and enemy bodies.

FR-GOLV-02: All damage and knockback between the player and enemies must be
applied exclusively through the hitbox/hurtbox overlap callback system defined
in the combat system; no velocity is transferred through body-to-body contact.

FR-GOLV-03: When multiple enemies share the movement lane with the player, the
player must be able to move freely in any direction without being pushed,
slowed, or repositioned by enemy body contact.

FR-GOLV-04: Enemies must not receive velocity from colliding with the player
body; enemy movement is driven solely by their AI state machine.

FR-GOLV-05: The physics coexistence rule applies during all player states:
Idle, Walk, Jump, Attack, Hurt, Knockdown, Get-Up, Grab, and Special Attack.

FR-GOLV-06: The physics coexistence rule applies during all enemy states: Idle,
Patrol, Aggro, Attack, Hurt, Knockdown, and Death.

FR-GOLV-07: Removing physics-based body separation must not affect the
hitbox/hurtbox overlap callbacks; hit registration must continue to function
correctly after this change.

FR-GOLV-08: Stage boundary walls must continue to block the player from moving
beyond the left and right edges of the walkable zone, independent of the
player-enemy physics coexistence change.

### Gap 2 — Stage pacing and encounter balance

FR-GOLV-10: Each stage zone must spawn a minimum of two enemies; no zone may
contain fewer than two enemies unless it is the zone immediately preceding the
boss room.

FR-GOLV-11: The first enemy encounter must occur within the first two screen
widths of horizontal player movement from the stage start; the player must not
traverse more than two screen widths before reaching enemies.

FR-GOLV-12: Each zone gate must not unlock until at least one enemy in that zone
has been defeated; zones may additionally require all enemies to be defeated
before the gate opens, as defined per zone in the stage data.

FR-GOLV-13: The horizontal spacing between consecutive enemy spawn positions
within a zone must be no greater than one screen width, ensuring enemies from
the same zone are visible or nearly visible simultaneously.

FR-GOLV-14: The total number of enemies across all non-boss zones in the first
stage must be at least eight, spread across at least three distinct zones.

FR-GOLV-15: The mix of enemy archetypes per zone must include at least two
different archetypes by the time the player reaches the third zone, preventing
the stage from feeling homogeneous.

FR-GOLV-16: All spawn positions, zone boundaries, and enemy archetype
assignments for each stage must be defined in a stage data configuration file
and must not be hardcoded in scene or controller logic.

### Gap 3 — Game over menu keyboard navigation

FR-GOLV-20: When the game over screen is displayed, the keyboard arrow keys
(up and down) must move the highlighted selection between available menu
options.

FR-GOLV-21: Pressing the Enter key while a menu option is highlighted on the
game over screen must activate that option.

FR-GOLV-22: The game over screen must highlight one option by default when it
first appears; the default selection must be the first available option.

FR-GOLV-23: If the "Continue" option is present and selected, activating it
must restart the current stage with the player's score preserved and lives
reset to the defined continue-lives count.

FR-GOLV-24: If the "Quit to Main Menu" option is selected, activating it must
navigate the player to the main menu scene and reset all game state.

FR-GOLV-25: The game over screen must register keyboard input immediately upon
becoming visible; there must be no input-deaf window after the screen appears.

FR-GOLV-26: Keyboard navigation on the game over screen must not conflict with
or be blocked by any lingering input listeners registered during gameplay.

### Gap 4 — Pause menu and high scores back navigation

FR-GOLV-30: Pressing the back action (Escape key or equivalent) while the pause
menu is open must unpause the game and return the player to the gameplay scene
in exactly the state it was in before pausing, with all timers, enemy states,
and player states preserved.

FR-GOLV-31: The "Resume" option in the pause menu, when activated, must produce
the same result as the back action described in FR-GOLV-30.

FR-GOLV-32: Pressing the back action while on the high scores screen must
navigate to the main menu scene; no other destination is acceptable.

FR-GOLV-33: The back action on the high scores screen must work regardless of
whether the screen was reached from the main menu or from the game over screen.

FR-GOLV-34: After returning from pause to gameplay, the in-game countdown timer
must resume counting from exactly where it stopped; no frames must be lost or
added.

FR-GOLV-35: All scene transitions triggered by back navigation must complete
without leaving orphaned event listeners, physics bodies, or scene instances
active in the background.

### Gap 5 — Timer expiry and game over trigger

FR-GOLV-40: When the in-game countdown timer reaches zero during gameplay, the
game must immediately trigger the game over sequence.

FR-GOLV-41: The game over sequence triggered by timer expiry must be identical
to the sequence triggered when the player loses their last life: the game over
screen must appear, the player's final score must be recorded, and keyboard
navigation on the game over screen must be active.

FR-GOLV-42: Timer expiry must be checked every fixed-timestep update to ensure
the trigger fires within one update cycle of the timer reaching zero, with no
possibility of the game continuing for additional frames after expiry.

FR-GOLV-43: When timer expiry triggers the game over sequence, the player's
current score must be preserved and passed to the game over screen unchanged.

FR-GOLV-44: If the player defeats the last enemy required to advance the stage
on the same frame that the timer reaches zero, the stage clear condition takes
priority over timer expiry; the game over sequence must not trigger in this
case.

FR-GOLV-45: The timer expiry trigger must be disabled while the game is paused;
the countdown must not reach zero and fire the game over sequence while the
pause menu is open.

## Non-Functional Requirements

NFR-GOLV-01: Removing physics-based player-enemy body separation must not
introduce any measurable frame-rate cost; the fixed-timestep update budget for
physics must remain within the existing 16.67 ms per frame target.

NFR-GOLV-02: Menu navigation input response (arrow key press to visible
highlight change) must occur within one rendered frame, with no perceptible
delay.

NFR-GOLV-03: Scene transitions triggered by back navigation (pause resume, high
scores back) must complete within 500 ms; transitions that take longer must
show a brief loading indicator.

NFR-GOLV-04: Stage pacing configuration (spawn positions, zone layouts, enemy
counts) must be expressed in a human-readable data format that a designer can
edit without modifying TypeScript source files.

NFR-GOLV-05: Timer expiry detection must have a resolution of one
fixed-timestep update (approximately 16.67 ms); the trigger may not fire more
than one update cycle late under any frame-rate condition.

## Open Questions

OQ-GOLV-01: Gap 1 — Should player and enemy physics bodies be fully disabled
(no collision shape at all), or should they retain their collision shapes but
have group-based filtering that prevents player-enemy body contacts while still
allowing player-wall and enemy-wall contacts? The implementation approach
affects whether wall-boundary enforcement for enemies can share the same
physics body or requires a separate mechanism.

OQ-GOLV-02: Gap 2 — What is the intended ratio of walking time to fighting
time per zone? A concrete target (e.g. "the player should be in combat for at
least 60% of total stage duration") would allow the spawn density tuning to be
verified quantitatively rather than by feel.

OQ-GOLV-03: Gap 2 — Should the zone gate in FR-GOLV-12 require all enemies in
the zone to be defeated, or only a minimum count? Requiring all enemies is
simpler to specify but may feel punishing if the player misses a stragglers;
requiring a minimum count is more forgiving but harder to balance.

OQ-GOLV-04: Gap 3 — The "Continue" option requires a "continue-lives count"
(FR-GOLV-23). What value should this be? FR-HU-19 says the player has a maximum
of 3 continues but does not specify how many lives are granted per continue.
This value must be confirmed before the spec can be written.

OQ-GOLV-05: Gap 4 — FR-GOLV-32 specifies that back from the high scores screen
always goes to the main menu. If the player reaches the high scores screen from
the game over screen, should the back action go to the game over screen first,
or directly to the main menu? A direct-to-main-menu path is simpler but may
feel abrupt if the player entered their name on the game over flow.
