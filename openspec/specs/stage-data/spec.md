# stage-data Specification

## Purpose
TBD - created by archiving change stage. Update Purpose after archive.
## Requirements
### Requirement: FR-SD-01 StageData type definition
A `StageData` TypeScript interface SHALL define all stage-configuration fields: `id` (number), `stageWidth` (number), `groundTop` (number), `groundBottom` (number), `parallaxLayers` (`ParallaxLayerDef[]`), `scrollTriggers` (`ScrollTriggerDef[]`), `spawnZones` (`SpawnZoneData[]`), `props` (`PropDef[]`).

#### Scenario: StageData is structurally typed
- **WHEN** a stage data file exports a const matching the StageData shape
- **THEN** TypeScript strict mode accepts it without error

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

### Requirement: FR-SD-03 No logic in data files
Stage data files SHALL contain only TypeScript constant objects. No functions, class instances, or control flow SHALL appear in a data file.

#### Scenario: Data file exports only a const
- **WHEN** `stage1Data.ts` is parsed
- **THEN** the file contains exactly one exported identifier and zero function declarations

### Requirement: FR-SD-04 Props reference asset keys from AssetKeys.ts
All `PropDef.assetKey` values in stage data files SHALL be constants imported from `AssetKeys.ts`, not inline string literals.

#### Scenario: PropDef uses AssetKeys constant
- **WHEN** a PropDef in stage data is compiled
- **THEN** the `assetKey` field references an exported constant from `AssetKeys.ts`

