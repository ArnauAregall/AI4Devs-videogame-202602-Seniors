## Context

`DestructibleProp` currently creates two Phaser `Image` objects at construction — `_spriteHealthy` (always visible) and `_spriteCrushed` (invisible until triggered). Because both are placed at the same screen X during construction and `setVisible(false)` does not remove an object from the scene graph, some rendering paths can cause both to be visible simultaneously — manifesting as two barrel sprites appearing side-by-side. The existing three-stage state machine (healthy → tinted on hit 1 → crushed on hit 2 → destroyed on hit 3) also couples visual state tightly to hit count, increasing complexity. Health item drops are always guaranteed on barrel destruction, which makes gameplay predictable.

## Goals / Non-Goals

**Goals:**
- Eliminate the dual-sprite architecture to fix the visual rendering bug
- Simplify the barrel lifecycle to: intact (single sprite) → destroyed (tint/visual swap on same sprite → fade out)
- Make health item drops probabilistic via a per-prop `dropChance` value
- Reduce drop to at most one health item per barrel (no multi-drop)

**Non-Goals:**
- Multi-hit intermediate visual states (complexity is removed, not replaced)
- Per-item animation or visual effects beyond the existing fade tween
- Changes to score items or any non-barrel prop types

## Decisions

### D-01 Single sprite instead of dual sprite
**Decision:** Replace the two-sprite (`_spriteHealthy` + `_spriteCrushed`) architecture with a single `_sprite` field. The intact barrel uses no tint. On destruction, apply `BARREL_CRUSHED_TINT` to the same sprite before the fade tween.

**Rationale:** The side-by-side rendering bug stems from having a second hidden sprite in the scene. A single sprite with conditional tint eliminates the source of the bug and simplifies positional tracking.

**Alternative considered:** Keep dual sprites but fix positioning. Rejected — adds future fragility and doesn't resolve the root cause (two objects occupying the scene at all times).

### D-02 Remove intermediate hit-count visual states
**Decision:** Remove the `BARREL_DAMAGED_TINT` intermediate state (hit 1 tint). A barrel shows the same intact visual for all hits until the final one. No visible feedback mid-combat.

**Rationale:** The user explicitly requested normal-only rendering until destroyed. Mid-hit feedback complicates the state machine without matching the stated requirements.

**Alternative considered:** Keep tint on hit-2 only (2-stage). Rejected — user wants clean binary: normal → destroyed.

### D-03 Probabilistic drop via `dropChance` in `PropDef`
**Decision:** Add `dropChance: number` (0.0–1.0) to `PropDef`. When a barrel is destroyed, roll `Math.random() < def.dropChance` to decide whether one health item drops. If `dropChance === 0` or `dropItemType === null`, never drop.

**Rationale:** Single-field probability is the simplest extension of the existing data-driven `PropDef` model. Stage authors control per-barrel drop rates without code changes.

**Alternative considered:** Global drop chance constant in `GameConfig`. Rejected — per-prop control is more flexible and allows different barrel configurations in future stages.

### D-04 Single item drop (not 1–3)
**Decision:** When a barrel drops, it spawns exactly one health item at the barrel's world position (no scatter). Remove the `ITEM_DROP_COUNT_MIN/MAX` usage in `DestructibleProp`.

**Rationale:** User feedback implies a simpler drop model: either an item appears or it doesn't. Multi-drop clutter is removed. Constants may remain in `GameConfig` for potential future use elsewhere.

## Risks / Trade-offs

- **[Risk] Existing tests for intermediate states will fail** → All DestructibleProp tests referencing `hitCount === 1` tint or hit-2 crushed swap must be updated.
- **[Risk] Stage 1 data already has `dropItemType` but not `dropChance`** → Stage1Data literal needs a `dropChance` value added to each `PropDef`. TypeScript will catch missing field at compile time.
- **[Trade-off] No mid-hit feedback** → Players cannot tell how many hits a barrel has taken. Acceptable per user requirement; a shake/flash effect could be added later as a separate non-breaking feature.

## Open Questions

_(none — all decisions above are sufficient to implement)_
