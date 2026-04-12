## ADDED Requirements

### Requirement: KnifeThrower registers Phaser animations
`KnifeThrowerController` constructor SHALL call `registerPunkAnims(scene)` (shared helper, guarded). It SHALL pass an `animKeys` map using punk animation keys (placeholder). References: FR-EB-01 through FR-EB-05, FR-EB-18.

#### Scenario: Anims registered on construction
- **WHEN** KnifeThrowerController is constructed
- **THEN** `scene.anims.create` is called for each punk animation key (or guard prevents duplicate)

#### Scenario: AnimKeys map contains all states
- **WHEN** KnifeThrowerController is constructed
- **THEN** `animKeys` contains entries for all EnemyState values
