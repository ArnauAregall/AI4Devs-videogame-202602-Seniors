## MODIFIED Requirements

### Requirement: FR-DP-02 Hit detection via hitbox overlap
A `DestructibleProp` SHALL register a hurtbox (static Arcade body rectangle). When an active player **or enemy** hitbox overlaps the hurtbox, the prop SHALL take one hit. The prop's hit registration uses hit count, not accumulated damage: each overlapping hitbox event counts as exactly one hit regardless of the hitbox's damage value.

#### Scenario: Prop takes a hit on player hitbox overlap
- **WHEN** an active player attack hitbox rect overlaps the prop's hurtbox rect
- **THEN** `_hitCount` increments by one

#### Scenario: Prop takes a hit on enemy hitbox overlap
- **WHEN** an active enemy attack hitbox rect overlaps the prop's hurtbox rect
- **THEN** `_hitCount` increments by one

#### Scenario: Dead prop does not respond to hits
- **WHEN** prop `_hitCount` has already reached `def.hp`
- **THEN** further overlap events are ignored
