## ADDED Requirements

### Requirement: FR-SD-01 StageData type definition
A `StageData` TypeScript interface SHALL define all stage-configuration fields: `id` (number), `stageWidth` (number), `groundTop` (number), `groundBottom` (number), `parallaxLayers` (`ParallaxLayerDef[]`), `scrollTriggers` (`ScrollTriggerDef[]`), `spawnZones` (`SpawnZoneData[]`), `props` (`PropDef[]`).

#### Scenario: StageData is structurally typed
- **WHEN** a stage data file exports a const matching the StageData shape
- **THEN** TypeScript strict mode accepts it without error

### Requirement: FR-SD-02 Three stage data files
The project SHALL contain exactly three stage data files: `src/data/stage1Data.ts`, `src/data/stage2Data.ts`, `src/data/stage3Data.ts`. Each exports a single `StageData` constant.

#### Scenario: Stage 1 data accessible
- **WHEN** `stage1Data` is imported
- **THEN** it has `id: 1`, `stageWidth ≥ 5000`, and `parallaxLayers.length ≥ 3`

#### Scenario: Stage 3 is the last stage
- **WHEN** `stage3Data` is imported
- **THEN** it has `id: 3`; no `stage4Data` file exists

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
