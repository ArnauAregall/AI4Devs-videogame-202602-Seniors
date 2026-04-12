# Enemy AI — Functional Requirements

## Overview

The enemy AI subsystem defines the behaviour of all non-player combatants in the Final Fight clone, including their patrol patterns, detection and aggression logic, attack routines, responses to being hit, and death behaviour including item drops. The system must support at least three distinct enemy archetypes with meaningfully different behaviours to create varied combat encounters.

## Functional Requirements

FR-EA-01: The game must include at least three enemy archetypes, each with distinct movement speed, health points, attack patterns, and aggro radius.
FR-EA-02: Archetype A (Brawler) must patrol a defined horizontal range at medium speed, close to melee range when the player is detected, and use a single heavy punch attack.
FR-EA-03: Archetype B (Rusher) must remain stationary until the player enters the aggro radius, then charge directly at the player at high speed and use a fast low-damage flurry attack.
FR-EA-04: Archetype C (Knife Thrower) must maintain a preferred distance from the player and throw a projectile attack when the player is within line-of-sight range and outside melee range.
FR-EA-05: Each enemy must have an Idle state played when not patrolling or engaging the player.
FR-EA-06: Each enemy must have a Patrol state in which the enemy moves back and forth within a defined spawn-zone boundary at a constant speed, turning around when reaching the boundary edge.
FR-EA-07: Each enemy must transition from Patrol to Aggro state when the player enters the enemy's aggro detection radius.
FR-EA-08: In the Aggro state, the enemy must move toward the player's current position at the enemy's defined movement speed.
FR-EA-09: Each enemy must have at least one Attack state that is triggered when the enemy is within its defined attack range of the player.
FR-EA-10: After completing an attack animation, the enemy must return to Aggro state and re-evaluate distance before attacking again.
FR-EA-11: Each enemy must have a Hurt state that interrupts its current action (except Death) when it receives a hit from the player.
FR-EA-12: Each enemy must have a Knockdown state triggered when the enemy's accumulated knockback exceeds a defined threshold.
FR-EA-13: When an enemy's health reaches zero, it must transition to a Death state, play the death animation, drop any defined item, and then be removed from the scene.
FR-EA-14: Each enemy archetype must define a drop table: a set of possible items with associated drop probabilities. An enemy may have a zero-probability drop (no item).
FR-EA-15: At most one item may be dropped per enemy death.
FR-EA-16: Multiple enemies in the same area must not stack on top of each other; they must stagger their approach timing so the player faces a maximum of two simultaneous attackers at any moment.
FR-EA-17: Enemies must not pass through each other or through stage boundary walls.
FR-EA-18: When the player is grabbed, all non-grabbing enemies in the area must pause their attack actions for the duration of the grab sequence to avoid simultaneous hits during the sequence.
FR-EA-19: The aggro detection radius must be configurable per enemy archetype and must not be a hardcoded pixel value.

## Non-Functional Requirements

NFR-EA-01: The AI decision loop for each enemy must complete in under 1 ms per enemy per fixed-timestep update.
NFR-EA-02: The game must support at least six simultaneously active enemies on screen without dropping below 60 fps.
NFR-EA-03: Enemy pathfinding must not use a full grid-based pathfinding algorithm — direct movement with simple obstacle avoidance is sufficient given the linear stage layout.

## Open Questions

- Should the Knife Thrower's projectile be deflectable by the player's attacks?
- Is there a boss enemy archetype required at the end of each stage? If so, what additional behaviour does the boss have (health bar, phase transitions, special attacks)?
- Should enemies respawn after being defeated, or are they one-time spawns per zone?
- Can enemies drop health pickups, or only point items (e.g. food, weapons)?
- Should enemies have a de-aggro condition (e.g. if the player moves far enough away, the enemy returns to Patrol)?
