# Enemy AI — Functional Requirements

## Overview

The enemy AI subsystem defines the behaviour of all non-player combatants in the Final Fight clone, including their patrol patterns, detection and aggression logic, attack routines, responses to being hit, and death behaviour including item drops. The system must support at least three distinct enemy archetypes with meaningfully different behaviours to create varied combat encounters.

## Functional Requirements

FR-EA-01: The game must include at least three enemy archetypes, each with distinct movement speed, health points, attack patterns, and aggro radius.
FR-EA-02: Archetype A (Brawler) must patrol a defined horizontal range at medium speed, close to melee range when the player is detected, and use a single heavy punch attack.
FR-EA-03: Archetype B (Rusher) must remain stationary until the player enters the aggro radius, then charge directly at the player at high speed and use a fast low-damage flurry attack.
FR-EA-04: Archetype C (Knife Thrower) must maintain a preferred distance from the player and throw a projectile attack when the player is within line-of-sight range and outside melee range; the projectile can be deflected back at the Knife Thrower by the player landing a melee attack on it, dealing full projectile damage to the Knife Thrower.
FR-EA-05: Each enemy must have an Idle state played when not patrolling or engaging the player.
FR-EA-06: Each enemy must have a Patrol state in which the enemy moves back and forth within a defined spawn-zone boundary at a constant speed, turning around when reaching the boundary edge.
FR-EA-07: Each enemy must transition from Patrol to Aggro state when the player enters the enemy's aggro detection radius.
FR-EA-08: In the Aggro state, the enemy must move toward the player's current position at the enemy's defined movement speed.
FR-EA-09: Each enemy must have at least one Attack state that is triggered when the enemy is within its defined attack range of the player.
FR-EA-10: After completing an attack animation, the enemy must return to Aggro state and re-evaluate distance before attacking again.
FR-EA-11: Each enemy must have a Hurt state that interrupts its current action (except Death) when it receives a hit from the player.
FR-EA-12: Each enemy must have a Knockdown state triggered when the enemy's accumulated knockback exceeds a defined threshold.
FR-EA-13: When an enemy's health reaches zero, it must transition to a Death state, play the death animation, drop any defined item, and then be removed from the scene.
FR-EA-14: Each enemy archetype must define a drop table: a set of possible items — which may include health pickups and point items — with associated drop probabilities. An enemy may have a zero-probability drop (no item).
FR-EA-15: At most one item may be dropped per enemy death.
FR-EA-16: Multiple enemies in the same area must not stack on top of each other; they must stagger their approach timing so the player faces a maximum of two simultaneous attackers at any moment.
FR-EA-17: Enemies must not pass through each other or through stage boundary walls.
FR-EA-18: When the player is grabbed, all non-grabbing enemies in the area must pause their attack actions for the duration of the grab sequence to avoid simultaneous hits during the sequence.
FR-EA-19: The aggro detection radius must be configurable per enemy archetype and must not be a hardcoded pixel value.
FR-EA-20: Each stage must include exactly one boss enemy that appears at the end of the stage's scroll extent; the boss's arrival locks the camera.
FR-EA-21: The boss must have two phase-transition thresholds at 50% and 25% of its maximum health; crossing each threshold triggers a short transition animation and permanently changes the boss's attack pattern.
FR-EA-22: In phase 2 (below 50% HP), the boss must add at least one new attack not used in phase 1.
FR-EA-23: In phase 3 (below 25% HP), the boss must increase its movement speed and attack frequency relative to phase 2.
FR-EA-24: The boss must have its own health points value, distinct from regular enemy archetypes, defined as a named constant.
FR-EA-25: Enemies are one-time spawns per zone; once defeated they do not respawn within the same playthrough.

## Non-Functional Requirements

NFR-EA-01: The AI decision loop for each enemy must complete in under 1 ms per enemy per fixed-timestep update.
NFR-EA-02: The game must support at least six simultaneously active enemies on screen without dropping below 60 fps.
NFR-EA-03: Enemy pathfinding must not use a full grid-based pathfinding algorithm — direct movement with simple obstacle avoidance is sufficient given the linear stage layout.

## Open Questions

- Should enemies have a de-aggro condition (e.g. if the player moves far enough away, the enemy returns to Patrol)?
