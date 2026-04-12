## Why

Barrels exist in the stage but currently only support player-attack destruction with a single optional item drop. Health items need a complete lifecycle: enemy attacks can also break barrels, a barrel produces 1–3 sushi pickups on destruction with visual damage states, and both the player and enemy AI can restore health by walking over dropped items.

## What Changes

- Barrel hit detection extended to accept enemy attack hitboxes (not only player)
- Barrel gains three visual damage states: healthy → damaged → crushed (two-hit intermediate)
- Barrel destruction triggers a random drop of 1–3 sushi item pickups instead of a single optional drop
- **BREAKING** Item pickup despawn timer (`FR-IP-02`) is made configurable per item type; sushi drops from barrels have no timer expiry (contradicts current hard-coded 15 s timer — resolved by making timeout optional in `ItemPickup`)
- Enemy entities become eligible to collect health items by spatial overlap
- Pickup is blocked for entities in knockdown, death, or invincibility state
- Health restoration amount per pickup defined as named constant `ITEM_HEALTH_RESTORE_AMOUNT = 25`
- Visual pickup effect (fade/pop) plays on collection before game object removal

## Capabilities

### New Capabilities

- `barrel-damage-states`: Three-stage visual damage tracking on `DestructibleProp` — healthy / damaged / crushed — with hit-count-based (not HP-based) threshold transitions and per-state sprite tinting or texture swap.
- `health-item-drop`: Random 1–3 sushi item spawn on barrel destruction; uniform random count selection; scatter positioning within walkable ground plane; random sushi variant (`prop-sushi-1` / `prop-sushi-2`) per item.

### Modified Capabilities

- `destructible-prop`: Extend `hit()` registration to accept enemy hitboxes in addition to player hitboxes. FR-DP-02 currently gates on player-only; must accept any attacker team. No structural change to `DestructibleProp` API — caller passes damage value same as today.
- `item-pickup`: (1) Extend collection eligibility to enemy entities in addition to the player. (2) Make the despawn timer optional (null = no expiry) to satisfy FR-HI-14 for sushi drops. (3) Add state-exclusion guard — entities in knockdown, death, or invincibility must not collect. (4) Emit `'healthPickup'` event on enemy collection so HUD/enemy-bar can update.

## Impact

- `finalfight-AAA/src/stage/DestructibleProp.ts` — hit-count tracking, damage states, multi-drop, enemy hitbox acceptance
- `finalfight-AAA/src/stage/ItemPickup.ts` — optional timer, enemy eligibility, state exclusion, pickup visual effect
- `finalfight-AAA/src/stage/StageData.ts` — `PropDef` drop count range fields
- `finalfight-AAA/src/config/GameConfig.ts` or `EnemyConfig.ts` — `ITEM_HEALTH_RESTORE_AMOUNT` constant (may already exist; check before adding)
- `finalfight-AAA/src/game/scenes/GameScene.ts` — wire enemy overlap queries against active item pickups each fixed tick
- No changes to player controller, enemy controller, or HUD spec (event bus already handles health updates)
