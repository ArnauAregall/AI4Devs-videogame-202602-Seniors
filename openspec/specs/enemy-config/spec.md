## ADDED Requirements

### Requirement: Enemy named constants
All enemy parameters SHALL be defined as named exports in `EnemyConfig.ts`. No magic numbers are permitted in any enemy source file. References: FR-EA-01, FR-EA-19, NFR-EA-01.

#### Scenario: Aggro radius is configurable per archetype
- **WHEN** `BRAWLER_AGGRO_RADIUS`, `RUSHER_AGGRO_RADIUS`, and `KNIFE_THROWER_AGGRO_RADIUS` are defined
- **THEN** each has a distinct pixel value and is not a hardcoded literal in any controller file

#### Scenario: Boss HP is a named constant
- **WHEN** `BOSS_MAX_HP` is defined in EnemyConfig
- **THEN** the BossController constructor uses `BOSS_MAX_HP` and no inline number
