# Enemy Behaviour — Functional Requirements

## Overview

This document covers three visual and mechanical gaps identified during playtesting: enemies do not display
distinct sprites per state, enemies do not deal damage to the player, and there is no per-enemy health bar.
It extends the state-machine contracts defined in `enemy-ai.md` and the combat contracts defined in
`combat-system.md` by adding animation, attack execution, and health-display detail that those files do not cover.

## Functional Requirements

### Sprite and Animation State Machine

FR-EB-01: Each enemy archetype must have a named animation clip for the Idle state; the clip must play
looping whenever the enemy is not moving or taking any action.

FR-EB-02: Each enemy archetype must have a named animation clip for the Walk state; the clip must play
looping whenever the enemy is moving horizontally during the Patrol or Aggro states.

FR-EB-03: Each enemy archetype must have a named animation clip for the Attack state; the clip must play
once from its first frame each time the enemy enters the Attack state.

FR-EB-04: Each enemy archetype must have a named animation clip for the Hurt state; the clip must play
once from its first frame each time the enemy transitions into the Hurt state.

FR-EB-05: Each enemy archetype must have a named animation clip for the Death state; the clip must play
once from its first frame when the enemy's HP reaches zero, and must not be interrupted by any other
state transition.

FR-EB-06: When an enemy transitions between any two states, the animation playing for the source state
must stop and the animation for the destination state must begin within the same game frame as the
state transition.

FR-EB-07: Each enemy sprite must be flipped horizontally to face the direction the enemy is currently
moving or targeting; the facing direction must update every frame it changes and must be consistent with
the direction used for movement velocity.

FR-EB-08: The Death animation must play to completion before the enemy's sprite and health bar are
removed from the scene; no state transition may interrupt the Death animation once it has begun.

FR-EB-09: All animation clip names and frame-range boundaries for each enemy archetype must be defined
as named constants in a single configuration location per archetype; no animation frame indices may
appear as inline literals in behaviour or controller code.

### Enemy Attack Behaviour and Damage

FR-EB-10: Each enemy archetype must define a base damage value for its attack as a named constant;
the Brawler, Rusher, and Knife Thrower archetypes may each have different base damage values.

FR-EB-11: Each enemy archetype must define an attack range as a named constant representing the maximum
distance at which the enemy will initiate an Attack state entry; this value is distinct from the aggro
radius defined in FR-EA-19 and must be smaller than or equal to it.

FR-EB-12: During the Attack state, the enemy's hitbox must be active only during the designated active
frames of the attack animation; the hitbox must be inactive before those frames begin and after they end.

FR-EB-13: Each enemy archetype must define an attack cooldown as a named constant representing the
minimum number of frames that must elapse from the end of one Attack state before the enemy may enter
the Attack state again.

FR-EB-14: When an enemy's active hitbox overlaps with the player's hurtbox, the player's HP must
decrease by the enemy's base damage value unless the player is in an invincibility window. This
requirement extends FR-CS-03, FR-CS-04, and FR-PL-15 to cover enemy-originated hits.

FR-EB-15: An enemy must not enter the Attack state while it is in the Hurt, Knockdown, or Death state;
the attack cooldown timer must not progress during those states.

FR-EB-16: The Brawler archetype's attack must activate a single close-range hitbox for a window of
consecutive frames corresponding to the punch portion of its Attack animation. Cross-references FR-EA-02.

FR-EB-17: The Rusher archetype's attack must activate a hitbox for multiple short windows within a
single Attack-state entry, corresponding to each rapid hit in its Attack animation; each window activation
uses the same base damage value. Cross-references FR-EA-03.

FR-EB-18: The Knife Thrower archetype's attack must emit a projectile during the release frame of its
Attack animation; the projectile must travel horizontally at a constant speed toward the player's
horizontal position at the moment of launch, and must remain active until it either hits the player
or exits the stage boundary. Cross-references FR-EA-04.

FR-EB-19: After an enemy's Attack state animation completes, the enemy must re-evaluate its distance
to the player; if the player is still within attack range and the cooldown has elapsed, the enemy may
enter the Attack state again. Cross-references FR-EA-10.

### Enemy Health Bar

FR-EB-20: Every non-boss enemy that is alive and visible on screen must display a health bar directly
above its sprite, centred on the sprite's horizontal midpoint, showing current HP as a fraction of
maximum HP.

FR-EB-21: The enemy health bar must update its displayed width within the same game frame that the
enemy's HP value changes, so that the bar always reflects the most recently applied damage.

FR-EB-22: The enemy health bar must not be visible before the enemy first enters the scene, and must
be removed from the scene at the same moment the enemy's Death animation begins.

FR-EB-23: The enemy health bar must follow the enemy sprite's world-space position every frame; its
horizontal centre must remain aligned with the sprite's horizontal midpoint and its vertical position
must maintain a fixed pixel offset above the top of the sprite.

FR-EB-24: The enemy health bar must be rendered at a scene depth that places it above the enemy sprite
and above all ground-level stage elements, so it is never obscured by the enemy's own sprite or by
stage floor decorations.

FR-EB-25: The total width, height, and vertical offset of the enemy health bar above the sprite top
must each be defined as named constants; no magic pixel values may appear inline in health-bar
rendering code.

FR-EB-26: Boss enemies must not display the per-enemy health bar defined in this section; the boss
uses the dedicated HUD health bar covered by FR-HU-08.

FR-EB-27: The filled portion of the enemy health bar must use a colour that is visually distinct from
the player's health bar colour; both colours must be defined as named constants.

## Non-Functional Requirements

NFR-EB-01: Enemy animation clip lookups must not cause the frame rate to drop below 60 fps when six
enemies are animating simultaneously on screen.

NFR-EB-02: All animation configuration for each enemy archetype (clip names, frame ranges, attack
frame windows) must be co-located in a single file or configuration object per archetype so that
sprite-sheet replacements require changes in one place only.

NFR-EB-03: Per-enemy health bar position updates must execute within the same update loop that
processes enemy movement, so that bars never lag a frame behind the sprite they follow.

## Open Questions

OQ-EB-01: FR-EB-07 specifies horizontal flipping to show facing direction. Should the enemy sprite
sheet include dedicated left-facing and right-facing frames, or should the renderer always flip a single
set of frames? Decision affects how FR-EB-09 constants are structured.

OQ-EB-02: FR-EB-12 specifies hitbox active frames per archetype. Should the active frame windows be
defined in the same constants block as animation clip names (FR-EB-09), or in a separate attack-data
record? This is an architectural question for the implementer-agent.

OQ-EB-03: FR-EB-18 specifies that the Knife Thrower projectile remains active until it hits the player
or exits the stage boundary. Should the projectile also be destroyed on contact with destructible props,
or only on player contact and stage boundary?

OQ-EB-04: FR-EB-20 applies to all non-boss enemies. Should enemies that have just spawned (pre-first
activation frame) already show the health bar at full health, or only after they first take damage or
the player enters their aggro radius? Depends on UX preference.
