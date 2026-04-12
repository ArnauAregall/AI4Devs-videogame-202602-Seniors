## REMOVED Requirements

### Requirement: Barrel damaged state after first hit
**Reason**: The 3-stage visual model is removed. Barrels now show intact appearance for all hits until the final one, then go directly to the destroyed (crushed) state. The intermediate tinted state adds complexity without improving gameplay readability.
**Migration**: Remove all tint logic that was applied on `_hitCount === 1`. The `BARREL_DAMAGED_TINT` constant may be removed from `GameConfig.ts`.

### Requirement: Barrel crushed state after second hit
**Reason**: The second hit no longer triggers a sprite swap. The crushed sprite (`_spriteCrushed`) is eliminated from the constructor. The crushed visual (tint applied to the single sprite) is now reserved for the destruction sequence only.
**Migration**: Remove `_spriteCrushed` field and all `setVisible()` toggling between healthy/crushed sprites.

## MODIFIED Requirements

### Requirement: Destruction on third hit
A `DestructibleProp` SHALL be destroyed immediately when `_hitCount` reaches or exceeds `def.hp` (default 3). On destruction, the single sprite SHALL have `BARREL_CRUSHED_TINT` applied before the destruction tween begins. The destruction sequence begins in the same fixed-timestep update that registers the final hit.

#### Scenario: Destruction sequence starts on final hit
- **WHEN** `hit()` is called on a barrel prop and `_hitCount` reaches `def.hp`
- **THEN** `_scheduleDestroy()` is invoked in the same tick and no further hits are accepted

#### Scenario: Crushed tint applied at start of destruction
- **WHEN** the destruction sequence starts
- **THEN** `BARREL_CRUSHED_TINT` is applied to the single `_sprite` before the fade tween plays

#### Scenario: Partial hits not reset between attackers
- **WHEN** a barrel has `_hitCount === 1` from a player attack and an enemy then lands one hit
- **THEN** `_hitCount` becomes 2 and is tracked toward the `def.hp` threshold (no visual change until destruction)

### Requirement: Visual state constants
All tint values and count thresholds used in `DestructibleProp` SHALL be defined as named constants in `GameConfig.ts`. No magic pixel values may appear inline.

#### Scenario: Crushed tint constant referenced
- **WHEN** the crushed tint is applied at destruction start
- **THEN** the value is sourced from `BARREL_CRUSHED_TINT`, not a literal hex value
