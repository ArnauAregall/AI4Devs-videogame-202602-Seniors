## MODIFIED Requirements

### Requirement: FR-SD-02 Three stage data files
The project SHALL contain exactly three stage data files: `src/data/stage1Data.ts`,
`src/data/stage2Data.ts`, `src/data/stage3Data.ts`. Each exports a single
`StageData` constant.

Stage 1 encounter layout SHALL satisfy all pacing constraints:

1. The first `scrollTriggers` entry SHALL have `worldX ≤ 768` (≤ 2 × canvas width
   of 384 px), ensuring the first enemy encounter occurs within two screen widths of
   the stage start.
2. Each non-boss `spawnZones` entry SHALL have a total enemy count ≥ 2 (sum of all
   `entries[].count` in that zone).
3. The total enemy count across all non-boss zones SHALL be ≥ 8.
4. There SHALL be ≥ 3 distinct `spawnZones` entries (excluding any boss zone).
5. By the third zone (index 2), the set of `archetype` values across all zone entries
   SHALL include at least two distinct values.
6. All `archetype` values used in `spawnZones` SHALL reference a registered archetype
   key that `EnemyManager` can resolve (`'brawler'`, `'rusher'`, `'knife-thrower'`,
   or `'boss'`).

#### Scenario: Stage 1 data accessible
- **WHEN** `stage1Data` is imported
- **THEN** it has `id: 1`, `stageWidth ≥ 5000`, and `layers.length ≥ 3`

#### Scenario: First scroll trigger within two screen widths
- **WHEN** `stage1Data.scrollTriggers` is examined
- **THEN** the first entry has `worldX ≤ 768`

#### Scenario: Each zone has at least two enemies
- **WHEN** any non-boss spawnZone in `stage1Data` is examined
- **THEN** the sum of `entries[].count` for that zone is ≥ 2

#### Scenario: At least two archetypes by zone 3
- **WHEN** zones 0, 1, and 2 of `stage1Data.spawnZones` are inspected
- **THEN** the union of `entries[].archetype` across those three zones contains
  at least two distinct values
