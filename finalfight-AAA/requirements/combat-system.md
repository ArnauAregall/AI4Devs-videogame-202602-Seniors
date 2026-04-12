# Combat System — Functional Requirements

## Overview

The combat system manages all damage exchanges between the player and enemies, defining how attacks connect, how damage is calculated, how characters respond to being hit, and how the combo system rewards sustained offensive play. It is the mechanical core of the game and must be precise enough to feel satisfying at 60 fps.

## Functional Requirements

FR-CS-01: Every attack action (player or enemy) must define a hitbox — a rectangular collision area that is active only during the designated active frames of the attack animation.
FR-CS-02: Every damageable character (player and enemies) must have a hurtbox — a rectangular collision area representing their vulnerable body region, which is always active unless the character is in an invincible state.
FR-CS-03: A hit is registered when an active hitbox overlaps with an active hurtbox belonging to a character on the opposing team (player team vs enemy team).
FR-CS-04: Each attack must define a base damage value; the target's health is reduced by this value when a hit is registered.
FR-CS-05: The player's special attack must deal damage calculated as a fixed multiplier of the light attack base damage value.
FR-CS-06: Each attack must define a knockback vector — a direction and distance that is applied to the target's position over a defined number of frames when a hit is registered.
FR-CS-07: Knockback must be applied relative to the direction of the attacker: if the attacker is facing right, the knockback pushes the target to the right; if facing left, to the left.
FR-CS-08: A combo is defined as two or more hits landing on the same target within a defined combo window time, without the attacker being interrupted.
FR-CS-09: The combo counter must increment by one for each additional hit landing within the combo window.
FR-CS-10: The combo window timer must reset to its full duration after each hit within the combo; it expires if no additional hit lands within the window.
FR-CS-11: When the combo window expires, the combo counter must reset to zero.
FR-CS-12: When a hit is registered, the target must enter a hit stun state for a defined number of frames during which it cannot act or change state.
FR-CS-13: Hit stun duration must be configurable per attack — heavy attacks must have longer hit stun than light attacks.
FR-CS-14: A single attack may only register one hit per active-frame window — the same hitbox may not deal damage to the same hurtbox more than once per swing.
FR-CS-15: The player's grab attack, when it connects, must bypass the enemy's hurtbox overlap check and instead use a proximity range check; once initiated, the grab sequence cannot be interrupted by enemy attacks.
FR-CS-16: All hitbox and hurtbox dimensions must be defined as named constants, not inline pixel values.
FR-CS-17: Hitboxes must be visualisable in a debug mode — when debug rendering is enabled, all active hitboxes and hurtboxes must be drawn as coloured overlays on screen.

## Non-Functional Requirements

NFR-CS-01: Hit detection must run every fixed-timestep update to ensure no frames are skipped even when the renderer drops below 60 fps.
NFR-CS-02: Hit detection must resolve all overlaps and apply results within 1 ms per fixed-timestep update for up to six simultaneously active hitboxes.
NFR-CS-03: The combo window timer must have a resolution of at least one fixed-timestep update interval to prevent rounding errors.
NFR-CS-04: Debug hitbox rendering must be toggleable at runtime without reloading the game.

## Open Questions

- Should there be a damage scaling system where successive hits in a long combo deal reduced damage (diminishing returns)?
- Is there a maximum combo window time (e.g. 500 ms) or is it purely frame-count based?
- Should hit stun duration scale with combo count (i.e. enemies become combo-resistant after a certain number of hits)?
- Should the grab attack have its own damage value separate from the throw's knockback damage, or is the throw's impact the only damage event?
- Are there any attacks that deal area-of-effect damage (hitting multiple enemies simultaneously with one hitbox)?
