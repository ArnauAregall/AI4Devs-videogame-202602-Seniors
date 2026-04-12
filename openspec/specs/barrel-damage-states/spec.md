# barrel-damage-states Specification

## Purpose
Defines the three-stage visual damage state machine for destructible barrel props. Each hit transitions the barrel through a distinct visual state — healthy → damaged → crushed — before destruction begins.

## Requirements

### Requirement: Barrel damaged state after first hit
A `DestructibleProp` of subtype `barrel` SHALL display a visually distinct damaged state after recording its first hit. The damaged state must be visible without debug rendering and must persist until a second hit is recorded or the prop is destroyed.

#### Scenario: Damaged tint applied after first hit
- **WHEN** `hit()` is called on a barrel prop for the first time (`_hitCount` becomes 1)
- **THEN** the healthy sprite tint changes to indicate damage (e.g., `0xffaa88`) and the change is visible on the next render frame

#### Scenario: Damaged state persists on subsequent movement
- **WHEN** the barrel has `_hitCount === 1` and the camera scrolls
- **THEN** the barrel continues to display the damaged-state tint at its updated screen position

### Requirement: Barrel crushed state after second hit
A `DestructibleProp` of subtype `barrel` SHALL display a second visually distinct crushed state after recording its second hit. The crushed state must differ from both the healthy and damaged states and must persist until destruction.

#### Scenario: Crushed sprite shown after second hit
- **WHEN** `hit()` is called on a barrel prop for the second time (`_hitCount` becomes 2)
- **THEN** the healthy sprite is hidden and the crushed sprite (grey tint, `0x888888`) becomes visible on the next render frame

#### Scenario: Crushed state persists until destruction
- **WHEN** the barrel has `_hitCount === 2` and no further hits occur
- **THEN** the crushed sprite remains visible until `hit()` is called a third time

### Requirement: Destruction on third hit
A `DestructibleProp` SHALL be destroyed immediately when `_hitCount` reaches or exceeds `def.hp` (default 3). The destruction sequence begins in the same fixed-timestep update that registers the final hit.

#### Scenario: Destruction sequence starts on third hit
- **WHEN** `hit()` is called on a barrel prop for the third time (`_hitCount` becomes 3)
- **THEN** `_scheduleDestroy()` is invoked in the same tick and no further hits are accepted

#### Scenario: Partial hits not reset between attackers
- **WHEN** a barrel has `_hitCount === 1` from a player attack and an enemy then lands one hit
- **THEN** `_hitCount` becomes 2 and the crushed state is displayed (hit count is not reset on attacker change)

### Requirement: Visual state constants
All hit-state tint values and count thresholds SHALL be defined as named constants in `GameConfig.ts`. No magic pixel values may appear inline in `DestructibleProp`.

#### Scenario: Damaged tint constant referenced
- **WHEN** the damaged tint is applied in `hit()`
- **THEN** the value is sourced from `BARREL_DAMAGED_TINT` (or equivalent named constant), not a literal hex value
