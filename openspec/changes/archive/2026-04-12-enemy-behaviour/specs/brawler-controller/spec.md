## ADDED Requirements

### Requirement: Brawler registers Phaser animations
`BrawlerController` constructor SHALL call `registerPunkAnims(scene)` — an exported helper that calls `scene.anims.create()` for each of: idle (looping), walk (looping), attack/punch (play-once), hurt (play-once), death (play-once). Each call is guarded by `if (!scene.anims.exists(key))`. References: FR-EB-01 through FR-EB-05, FR-EB-09.

#### Scenario: Anims registered on first construction
- **WHEN** BrawlerController is constructed
- **THEN** `scene.anims.create` is called for PUNK_ANIM_IDLE, PUNK_ANIM_WALK, PUNK_ANIM_ATTACK, PUNK_ANIM_HURT, PUNK_ANIM_DEATH

#### Scenario: Anims not re-registered on second construction
- **WHEN** a second BrawlerController is constructed in the same scene
- **THEN** `scene.anims.create` is NOT called again (guard prevents duplicate)

### Requirement: Brawler passes animKeys to base class
`BrawlerController` constructor SHALL pass `animKeys` mapping each `EnemyState` to the corresponding punk animation key constant. References: FR-EB-06.

#### Scenario: AnimKeys map is complete
- **WHEN** BrawlerController is constructed
- **THEN** `animKeys` contains entries for Idle, Patrol, Aggro, Attack, Hurt, Knockdown, and Death
