## Why

Barrels currently create two overlapping sprites at construction (healthy and crushed), causing the crushed sprite to render visibly alongside the healthy one — a visual artefact. Additionally, the existing three-stage damage system (tint on hit 1, crushed on hit 2, destroy on hit 3) adds complexity without clear gameplay value, and health item drops are always guaranteed rather than random, making the game too predictable.

## What Changes

- **Fix dual-sprite rendering bug**: Eliminate the two-sprite architecture. Barrel starts with a single intact sprite; the crushed texture is composited via tint on the same sprite only when destroyed, rather than a pre-created hidden sibling object.
- **Simplify damage model**: Remove the 3-stage intermediate tinting. A barrel takes hits silently until `def.hp` is reached, at which point it immediately transitions to the crushed/destroyed visual, lingers briefly, then fades out.
- **Randomise item drop**: Replace guaranteed drop-on-destroy with a configurable per-prop drop chance (`dropChance: number` in `PropDef`, range 0.0–1.0). Barrels with no drop roll will be destroyed without spawning any health item.
- **Single item per barrel**: Simplify drop to at most one health item per barrel (no 1–3 multi-drop). Reduces visual noise and balances health availability.

## Capabilities

### New Capabilities

_(none — all changes are modifications to existing capabilities)_

### Modified Capabilities

- `barrel-damage-states`: Remove the 3 intermediate visual stages. New model: single intact sprite, no tint-on-hit progression; only the final destruction shows the crushed visual.
- `health-item-drop`: Replace guaranteed multi-drop (1–3 items) with probabilistic single-drop. `PropDef.dropChance` (0.0–1.0) governs whether one item drops; 0 = never, 1 = always, 0.5 = 50%.
- `destructible-prop`: Remove `_spriteCrushed` second sprite from constructor. Use tint or texture-swap on the single `_spriteHealthy` sprite for the destroyed visual state.

## Impact

- `finalfight-AAA/src/stage/DestructibleProp.ts` — major simplification (remove `_spriteCrushed`, update `hit()`, `_scheduleDestroy()`, `destroy()`)
- `finalfight-AAA/src/stage/StageData.ts` — add `dropChance: number` to `PropDef`; update `stage1Data` barrel definitions
- `finalfight-AAA/src/config/GameConfig.ts` — add `BARREL_DROP_CHANCE_DEFAULT` constant; remove `ITEM_DROP_COUNT_MIN/MAX` (or retain for future use)
- `finalfight-AAA/src/__tests__/DestructibleProp.test.ts` — update tests for new single-sprite model and probabilistic drop
- `openspec/specs/barrel-damage-states/spec.md` — delta: simplify to 2-state model
- `openspec/specs/health-item-drop/spec.md` — delta: probabilistic drop, single item
- `openspec/specs/destructible-prop/spec.md` — delta: single sprite implementation note
