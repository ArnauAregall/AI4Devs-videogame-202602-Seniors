# Boss Attacks — Functional Requirements

## Overview

The boss enemy has a two-attack repertoire: a standard attack used throughout normal combat exchanges, and a rare critical attack that deals substantially greater damage, is gated behind a 5-second cooldown, and is telegraphed to the player through a visually distinct charge animation. The design goal is a boss encounter that is threatening yet learnable — the player can read the critical attack tell after a few encounters and respond accordingly. This file covers only the boss attack decision logic, animation states, cooldown mechanics, telegraph behaviour, and game-feel requirements. General hitbox and hurtbox rules are defined in `combat-system.md`; base enemy attack mechanics are defined in `enemy-behaviour.md`; boss phase transitions and arrival conditions are defined in `enemy-ai.md`. No requirements in those files are duplicated here.

## Functional Requirements

## Area 1 — Standard boss attack

FR-BA-01: The boss must have a designated standard attack that is used during normal combat proximity, throughout all phases of the encounter.

FR-BA-02: The standard attack must play a dedicated standard-attack animation state that is visually distinct from the boss's idle and walk animation states.

FR-BA-03: The standard attack must follow the hitbox and hurtbox model defined in `combat-system.md` (FR-CS-01 through FR-CS-04): the hitbox is active only during the defined active frames of the standard-attack animation, and the hit is registered when the hitbox overlaps the player's hurtbox.

FR-BA-04: The standard attack must apply a base damage value defined as a named constant. This constant is the reference point against which critical attack damage is compared.

FR-BA-05: The standard attack must apply a knockback vector defined as a named constant (direction and magnitude).

FR-BA-06: After completing the standard attack animation, the boss must return to its Aggro state and re-evaluate distance before choosing its next action, consistent with FR-EA-10.

FR-BA-07: The boss must respect an attack cooldown between standard attacks, defined as a named constant. The cooldown prevents the boss from immediately chaining standard attacks without any movement or pause.

FR-BA-08: The standard attack hitbox must be inactive at all times outside the designated active frames. No damage must register before or after the active window.

FR-BA-09: The standard attack base damage value must be defined as a named constant separate from any regular enemy archetype damage constant.

## Area 2 — Critical attack definition and rarity

FR-BA-10: The boss must have a second, critical attack that is distinct from the standard attack in animation, damage, knockback, and player impact.

FR-BA-11: The critical attack must deal damage that is significantly greater than the standard attack base damage value. Both values must be defined as named constants and the ratio between them must be documented.

FR-BA-12: The boss must select the critical attack through a probabilistic decision made at the moment it would otherwise trigger a standard attack. The probability of choosing the critical attack must be low enough that the standard attack is encountered far more frequently.

FR-BA-13: The critical attack probability must be defined as a named constant so that it can be tuned without code changes.

FR-BA-14: The critical attack must not be selected if its cooldown is still active; if the cooldown is active at the moment of the attack decision, the boss must default to the standard attack.

FR-BA-15: The critical attack must activate a hitbox during its own designated active frames, independent of the standard attack active frames, following the same hitbox model (FR-CS-01).

FR-BA-16: The critical attack hitbox must be inactive at all times outside the designated active frames of the critical attack animation, including during the telegraph phase.

FR-BA-17: The critical attack must apply a knockback magnitude defined as a named constant, which must be greater than the standard attack knockback magnitude.

FR-BA-18: The critical attack must apply a hit-stun duration defined as a named constant, which must be longer than the standard attack hit-stun duration, consistent with FR-CS-13.

FR-BA-19: The critical attack base damage, knockback, and hit-stun constants must all be defined in the same configuration block as the standard attack constants.

## Area 3 — Critical attack cooldown

FR-BA-20: After the boss begins executing a critical attack, the critical attack must be unavailable for exactly 5 seconds (300 ticks at 60 fps). This cooldown is defined as a named constant.

FR-BA-21: The cooldown timer must start from the first frame of the critical attack animation, not from the moment the hit lands.

FR-BA-22: During the cooldown period the boss must continue using its standard attack normally whenever the attack condition is met. The cooldown must not suppress standard attack usage.

FR-BA-23: If the boss is interrupted during the critical attack animation (e.g. by being knocked back or entering a hurt state), the cooldown timer must still start and run to completion. Starting the animation is sufficient to trigger the cooldown.

FR-BA-24: The cooldown timer must count down only while the boss is alive and in an active state. The timer must not advance while the game is paused.

FR-BA-25: The cooldown state must be tracked as an internal countdown field on the boss, initialised to zero at spawn and set to the 5-second constant value when the critical attack animation begins.

## Area 4 — Telegraph, game feel, and player experience

FR-BA-30: Before the critical attack's active hit frames, the boss must play a telegraph phase using an animation state that is visually distinct from both the standard attack animation and the idle animation. This animation acts as the observable tell that the player can learn to recognise.

FR-BA-31: The telegraph phase must last for a minimum duration defined as a named constant, establishing a guaranteed player reaction window of at least 20 frames (approximately 333 ms at 60 fps) before the hitbox becomes active.

FR-BA-32: The telegraph animation must begin before any hitbox becomes active. No damage must be possible to receive until the telegraph phase completes and the active hit frames begin.

FR-BA-33: The critical attack's knockback applied to the player must be visually and mechanically distinguishable from the standard attack knockback — the player character must move a clearly greater distance, or remain in hit-stun for a clearly longer duration, or both.

FR-BA-34: The combination of telegraph duration, critical attack damage, and increased knockback must produce a consistent rhythm that the player can learn after repeated encounters. The encounter must feel threatening but not arbitrary.

FR-BA-35: The boss must not be able to cancel the telegraph phase once it has begun. If the player deals damage to the boss during the telegraph phase, the telegraph animation must complete before the boss transitions to its hurt state — unless the hit is sufficient to kill the boss.

FR-BA-36: The overall attack pattern — standard attack interspersed with infrequent critical attacks — must ensure the player spends the majority of the encounter responding to standard attacks, with the critical attack arriving as an occasional escalation.

## Non-Functional Requirements

NFR-BA-01: The telegraph phase reaction window must be no shorter than 20 frames (approximately 333 ms at 60 fps) to ensure the tell is perceivable at normal gameplay speed.

NFR-BA-02: The 5-second critical attack cooldown must be implemented as a tick-based countdown at 60 ticks per second (300 ticks), so that its precision is frame-accurate and not subject to floating-point time drift.

NFR-BA-03: The critical attack damage must be sufficiently greater than the standard attack damage that the player can distinguish a critical hit from a standard hit by HP loss alone, without requiring a visual indicator.

NFR-BA-04: The critical attack must be memorable and learnable: after no more than three critical attack encounters in a single playthrough, a skilled player must be able to identify the telegraph tell and react before the hitbox becomes active.

NFR-BA-05: All boss attack configuration constants (standard damage, critical damage, cooldown ticks, knockback values, telegraph duration, probability) must reside in a single named configuration block to allow rapid tuning.

## Open Questions

OQ-BA-01: What is the exact probability value for the critical attack selection? This must be resolved by the human operator before the specification can define the decision logic. A suggested starting range is 10%–20% per attack opportunity.

OQ-BA-02: What are the exact damage values for the standard attack and the critical attack? The ratio between them must also be decided (e.g. critical deals 2× or 3× standard damage). These must be set by the human operator.

OQ-BA-03: During the telegraph phase, is the boss temporarily vulnerable to player counter-attacks at reduced or normal damage? Making the boss take increased damage during the telegraph phase would reward skilled play; making it invulnerable would protect the pacing. This is a design decision for the human operator.

OQ-BA-04: Is a visual cooldown indicator required in the HUD or on the boss sprite? A visible indicator (e.g. a pulsing glow, icon, or bar) would help players understand the cooldown rhythm, but it adds implementation cost. This is optional per FR-BA-20 but must be explicitly decided by the human operator.
