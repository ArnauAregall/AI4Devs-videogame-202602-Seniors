## ADDED Requirements

### Requirement: FR-SZ-01 SpawnZoneData type
A `SpawnZoneData` constant object SHALL define: `id` (string), `triggerWorldX` (number), `entries` (array of `{ archetype: string; count: number; staggerMs: number }`), and `triggerType` (`'scroll'` | `'timed'`).

#### Scenario: SpawnZoneData is a plain TypeScript constant
- **WHEN** a stage data file defines a spawn zone
- **THEN** the zone is expressed as a `SpawnZoneData` literal with no class instantiation

### Requirement: FR-SZ-02 Staggered enemy entry
The SpawnController SHALL not spawn all enemies simultaneously. Each enemy in a zone SHALL be spawned with a delay of `staggerMs` milliseconds after the previous one.

#### Scenario: Enemies spawn with delay
- **WHEN** a spawn zone is activated with `staggerMs = 500` and `count = 3`
- **THEN** enemy 1 spawns at t=0, enemy 2 at t=500ms, enemy 3 at t=1000ms

#### Scenario: Enemies spawn from off-screen right edge
- **WHEN** an enemy is spawned
- **THEN** its initial world X is `cameraX + CANVAS_WIDTH + SPAWN_OFFSCREEN_MARGIN`

### Requirement: FR-SZ-03 Zone cleared event
The SpawnController SHALL emit `'zoneCleared'` when the last enemy in the zone has been defeated. The SpawnController tracks living-enemy count by listening for an `'enemyDefeated'` event on the shared scene event bus.

#### Scenario: Zone clears after last enemy defeated
- **WHEN** all enemies from the zone have been defeated
- **THEN** SpawnController emits `'zoneCleared'` exactly once

#### Scenario: Zone does not clear prematurely
- **WHEN** one of two enemies is defeated
- **THEN** `'zoneCleared'` is NOT emitted

### Requirement: FR-SZ-04 SpawnController emits typed spawn events
SpawnController SHALL emit `'enemySpawn'` with payload `{ archetype: string; x: number; y: number }` on the `GameScene` event bus, not call any enemy constructor directly.

#### Scenario: Spawn event dispatched on bus
- **WHEN** a spawn timer fires
- **THEN** `scene.events.emit('enemySpawn', { archetype, x, y })` is called
