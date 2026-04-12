## ADDED Requirements

### Requirement: Per-state animation clip constants
`EnemyConfig.ts` SHALL define named animation-clip constants for each enemy archetype: clip key string, frame count, frame rate (fps), and active-frame start/end indices for the attack clip. No magic-number frame indices or string literals SHALL appear in controller source files. References: FR-EB-01, FR-EB-02, FR-EB-03, FR-EB-04, FR-EB-05, FR-EB-09.

#### Scenario: Constants exist for every Punk state
- **WHEN** `EnemyConfig.ts` is imported
- **THEN** `PUNK_ANIM_IDLE`, `PUNK_ANIM_WALK`, `PUNK_ANIM_ATTACK`, `PUNK_ANIM_HURT`, `PUNK_ANIM_DEATH` each resolve to a non-empty string

#### Scenario: Frame count constant for each clip
- **WHEN** reading `PUNK_IDLE_FRAME_COUNT`
- **THEN** it equals 4 and matches the actual PNG width ÷ frame width

### Requirement: Phaser animation registration per archetype
Each archetype constructor SHALL call a registration helper that calls `scene.anims.create()` for each state clip. Registration MUST be guarded so it is a no-op if the animation key already exists (idempotent). References: FR-EB-01 through FR-EB-05, FR-EB-09.

#### Scenario: Registration is idempotent
- **WHEN** the registration helper is called twice for the same scene
- **THEN** `scene.anims.create()` is called at most once per key

#### Scenario: Death clip uses correct texture key
- **WHEN** the punk death animation is registered
- **THEN** it references `ASSET_KEY_PUNK_DEATH` as its texture key

### Requirement: Animation playback on state entry
`EnemyController._onEnterState()` SHALL call `this._sprite.play(animKey, true)` with the animation key for the new state. The `ignoreIfPlaying` argument is false so the animation always restarts on re-entry. References: FR-EB-06.

#### Scenario: Idle animation plays on Idle entry
- **WHEN** state transitions to Idle
- **THEN** `sprite.play` is called with the Idle animation key

#### Scenario: Attack animation plays on Attack entry
- **WHEN** state transitions to Attack
- **THEN** `sprite.play` is called with the Attack animation key

#### Scenario: Death animation plays on Death entry
- **WHEN** state transitions to Death
- **THEN** `sprite.play` is called with the Death animation key

### Requirement: Death animation completion guard
The Death animation SHALL play to completion before the enemy is removed. `EnemyController._tickDeath()` MUST wait for `DEATH_LINGER_FRAMES` ticks after entering Death state before calling `destroy()`. The sprite's `on('animationcomplete')` event is NOT used (timing is governed by the existing linger-frame counter). References: FR-EB-08.

#### Scenario: Sprite not destroyed before linger expires
- **WHEN** enemy enters Death state and 0 ticks have elapsed
- **THEN** sprite.destroy is not called

#### Scenario: Sprite destroyed after linger expires
- **WHEN** `DEATH_LINGER_FRAMES` ticks have elapsed in Death state
- **THEN** sprite.destroy is called exactly once

### Requirement: Facing-direction flip every tick
`EnemyController.fixedUpdate()` SHALL call `this._sprite.setFlipX(!this._facingRight)` on every tick, ensuring the sprite orientation always matches the current facing direction. References: FR-EB-07.

#### Scenario: Sprite flipped when facing left
- **WHEN** `_facingRight` is false
- **THEN** `sprite.setFlipX(true)` is called during fixedUpdate

#### Scenario: Sprite unflipped when facing right
- **WHEN** `_facingRight` is true
- **THEN** `sprite.setFlipX(false)` is called during fixedUpdate
