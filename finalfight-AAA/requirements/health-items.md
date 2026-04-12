# Health Items — Functional Requirements

## Overview

Health items are sushi pickups that exist exclusively as drops from destroyed barrels. Both the player and enemy AI can destroy barrels through combat and can consume health items by walking over them. This is a closed economy — no other source of health items exists in the game. This document builds on the destructible prop foundation established in FR-ST-09 and FR-ST-10 by specifying the full barrel damage lifecycle, the drop distribution, the pickup mechanic, and the health restoration behaviour.

## Functional Requirements

## Area 1 — Barrel destruction by player and enemy

FR-HI-01: Both the player and any enemy AI may hit a barrel using any attack action (light attack, heavy attack, grab throw, or special attack); the hitbox active during that attack must be checked against the barrel's collision bounds every fixed-timestep update.

FR-HI-02: A barrel that is hit must record each hit separately regardless of the damage value of the attack; only the hit count determines destruction, not accumulated damage. Extends FR-ST-09.

FR-HI-03: A barrel must be destroyed after it has accumulated exactly three hits from any combination of player and enemy attacks; the third hit triggers destruction immediately on the same fixed-timestep update it is registered.

FR-HI-04: A barrel must display a visually distinct damaged state after the first hit that persists until the barrel is destroyed; the damaged state must be visible to the player without requiring debug rendering.

FR-HI-05: A barrel must display a second visually distinct crushed state after the second hit that differs from both the healthy and the first damaged state; this crushed state persists until destruction begins.

FR-HI-06: A barrel that has been hit once or twice must continue to register subsequent hits; partial damage is not reset on contact with a new attacker.

FR-HI-07: Once a barrel's destruction sequence begins, it must not register further hits or block any hitbox queries.

FR-HI-08: A barrel removed from the stage must have all its associated physics bodies, collision bounds, and scene objects destroyed within the same fixed-timestep update that triggers destruction.

FR-HI-09: A barrel must play its destruction animation before being removed from the scene; the animation must complete within 500 ms. Extends NFR-ST-04.

## Area 2 — Random health item drop on barrel destruction

FR-HI-10: When a barrel is destroyed, it must drop between one and three health item pickups; the count is determined at the moment of destruction using uniform random selection over the range [1, 3].

FR-HI-11: Each dropped health item must be represented by the sushi sprite registered in the asset manifest (ASSET_KEY_PROP_SUSHI_1 or ASSET_KEY_PROP_SUSHI_2); the choice of sushi variant per item is random and independent.

FR-HI-12: All dropped health items must spawn at or within a small radius of the barrel's last world-space position; no item may spawn outside the walkable ground plane boundaries.

FR-HI-13: When multiple items are dropped from the same barrel, each item must be placed at a distinct position so that items do not fully overlap one another at the time of spawn.

FR-HI-14: Dropped health items must persist on the stage indefinitely until collected or the scene ends; they do not expire on a timer.

FR-HI-15: Each health item must have its own independent collision bounds that the player and each enemy can query independently; collecting one item must not affect the collision state of sibling items dropped from the same barrel.

FR-HI-16: Health items dropped by a barrel destroyed by an enemy are collectable by the player with the same rules as items dropped by player-destroyed barrels; item ownership is not assigned.

FR-HI-17: All health item spawn positions, drop count range, scatter radius, and sprite key selection must use named constants; no magic numbers may appear inline in the drop logic.

## Area 3 — Health item pickup by player and enemy

FR-HI-20: A health item is consumed when the player's hurtbox or an enemy's hurtbox spatially overlaps the item's collision bounds; no input action is required to trigger a pickup.

FR-HI-21: Pickup detection must be evaluated every fixed-timestep update for all active health items and all active entities on the stage.

FR-HI-22: A health item must be consumed at most once; on first overlap with any eligible entity, the item must be immediately removed from the stage and marked inactive so that no subsequent entity can collect it in the same or a later update tick.

FR-HI-23: Both the player and all enemy AI archetypes (including the boss) are eligible to collect health items by overlap; there is no entity-type restriction on pickup.

FR-HI-24: An entity that is in a knockdown, death, or invincibility state must not consume health items while in that state; the overlap must be ignored until the entity returns to an eligible state.

FR-HI-25: An enemy entity must not actively pursue health items; pickup is purely incidental to movement, not a directed AI behaviour.

FR-HI-26: If two entities simultaneously overlap the same item in the same fixed-timestep update, only the first entity processed in that update tick receives the health restoration; the item must be removed before processing the second entity's overlap.

## Area 4 — Health restoration, cap, and visual feedback

FR-HI-30: Consuming a health item must restore exactly 25 health points to the collecting entity; the restoration value must be defined as a named constant.

FR-HI-31: Health restoration is applied immediately on pickup within the same fixed-timestep update that the overlap is detected.

FR-HI-32: An entity's health after restoration must not exceed its maximum health points value; any excess restoration beyond the maximum is discarded.

FR-HI-33: The player's HUD health bar must update its displayed value within the same render frame that follows the fixed-timestep update in which the player collected a health item.

FR-HI-34: An enemy's overhead health bar must update its displayed width within the same render frame that follows the fixed-timestep update in which that enemy collected a health item. Consistent with FR-EB-21.

FR-HI-35: The sushi sprite must play a brief pickup visual effect (fade out, scale pop, or particle burst) lasting no longer than 300 ms before being fully removed from the scene; the item must be considered consumed from the moment of first overlap, not when the visual effect ends.

FR-HI-36: A collecting entity that is already at maximum health may still trigger the pickup (removing the item from the stage) but no health change is applied and the HUD must not animate a change.

## Non-Functional Requirements

NFR-HI-01: Pickup detection must resolve all item-entity overlaps within one fixed-timestep update cycle (≤ 16 ms) for a scene containing up to 12 simultaneously active health items and 8 simultaneously active entities.

NFR-HI-02: The visual pickup effect (FR-HI-35) must begin playing on the same render frame as the overlap detection; no perceptible delay between the player walking over an item and the visual response is acceptable.

NFR-HI-03: Random item drop count and sprite variant selection must produce a uniform distribution with no observable bias across 1 000 or more barrel destructions.

NFR-HI-04: Barrel hit-state visual transitions (healthy → damaged → crushed) must update within the same render frame that the hit is registered so that combat feedback feels immediate.

## Open Questions

OQ-HI-01: The prompt specification states that `go-live-qa.md` contains barrel-related FRs covering 3-hit destruction to be referenced here. No such FRs were found in go-live-qa.md during authoring of this document. The relevant FRs are FR-ST-09 and FR-ST-10 in `stage.md` and the internal FR-DP-01 through FR-DP-05 annotations in DestructibleProp.ts. This should be reconciled before OpenSpec propose: either add barrel hit-count FRs to stage.md or confirm that FR-HI-02 and FR-HI-03 in this file are the canonical source.

OQ-HI-02: Maximum health cap per entity — FR-PL-14 establishes the player maximum at 100 HP. Maximum HP values for each enemy archetype are not consolidated in a single requirements file; they are implied by EnemyConfig.ts constants. Before implementation, confirm whether enemy max HP values should be specified in `enemy-behaviour.md` or in a dedicated config requirements section so that FR-HI-32's cap check can reference a canonical source per archetype.

OQ-HI-03: Enemy AI health-seeking behaviour — FR-HI-25 states that enemies must not actively pursue health items. This is a deliberate design decision to keep the system simple. If the design intent changes so that low-health enemies should path toward nearby items, this FR must be revised and AI behaviour requirements in `enemy-ai.md` must be updated to include a health-seeking priority state.

OQ-HI-04: Barrel destruction by enemy attacks — FR-HI-01 permits enemy attacks to count toward barrel destruction. The existing DestructibleProp.ts hitbox check only queries player attack hitboxes (FR-DP-02 annotation). Implementing FR-HI-01 fully requires extending the hit-registration path to accept enemy hitboxes as well. This is a scope addition relative to the current implementation and should be flagged for the implementer.

OQ-HI-05: Item persistence across continues — FR-HI-14 states that items persist until collected or the scene ends. It is unclear whether a player "continue" (which respawns the player in the same scene) counts as a scene end for item purposes. Clarify whether active health items should be cleared on continue or retained.
