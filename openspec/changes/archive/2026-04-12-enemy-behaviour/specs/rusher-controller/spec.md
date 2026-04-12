## ADDED Requirements

### Requirement: Rusher registers Phaser animations
`RusherController` constructor SHALL call `registerPunkAnims(scene)` (shared with BrawlerController, guarded). It SHALL pass an `animKeys` map identical to the Brawler's map (punk sprite placeholder). References: FR-EB-01 through FR-EB-05, FR-EB-17.

#### Scenario: Anims registered on construction
- **WHEN** RusherController is constructed
- **THEN** `scene.anims.create` is called for each punk animation key (or guard prevents duplicate)

#### Scenario: AnimKeys map contains all states
- **WHEN** RusherController is constructed
- **THEN** `animKeys` contains entries for Idle, Patrol, Aggro, Attack, Hurt, Knockdown, and Death
