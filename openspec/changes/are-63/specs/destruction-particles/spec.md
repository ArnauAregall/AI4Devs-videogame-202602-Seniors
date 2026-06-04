## ADDED Requirements

### Requirement: Debris particles emitted on destruction
When a `DestructibleProp` completes its destruction animation, the system SHALL emit a burst of debris particles at the prop's world position using `Phaser.GameObjects.Particles.ParticleEmitter.explode()`.

#### Scenario: Particles emitted after destruction animation completes
- **WHEN** the destruction animation's final frame completes on a prop
- **THEN** a one-shot particle burst is emitted at the prop's last screen position with the configured base particle count and gravity

#### Scenario: Particles use prop-appropriate texture
- **WHEN** debris particles are emitted for a barrel prop
- **THEN** the particle texture key matches the configured debris texture for that prop subtype

### Requirement: Particle count scales with quality setting
The debris particle count SHALL be multiplied by 0.5 (floored) when `GameConfig.PARTICLE_QUALITY` is `'low'`. When quality is `'high'`, the full configured count is used.

#### Scenario: High quality emits full particle count
- **WHEN** `GameConfig.PARTICLE_QUALITY` is `'high'` and the base count is 12
- **THEN** 12 debris particles are emitted

#### Scenario: Low quality emits 50% particle count
- **WHEN** `GameConfig.PARTICLE_QUALITY` is `'low'` and the base count is 12
- **THEN** 6 debris particles are emitted

#### Scenario: Low quality floors odd base counts
- **WHEN** `GameConfig.PARTICLE_QUALITY` is `'low'` and the base count is 11
- **THEN** 5 debris particles are emitted (Math.floor(11 * 0.5))

### Requirement: Particle gravity and lifespan are configurable
Debris particles SHALL use gravity-y and lifespan values defined as named constants in `GameConfig`. Particles SHALL self-destroy after their lifespan expires.

#### Scenario: Particles fall with configured gravity
- **WHEN** debris particles are emitted
- **THEN** each particle accelerates downward at `GameConfig.DEBRIS_PARTICLE_GRAVITY_Y` px/s²

#### Scenario: Particles expire after configured lifespan
- **WHEN** debris particles are emitted with `GameConfig.DEBRIS_PARTICLE_LIFESPAN_MS` set to 800
- **THEN** all particles are destroyed within 800ms of emission

### Requirement: Particle quality constant in GameConfig
`GameConfig` SHALL export a `PARTICLE_QUALITY` field of type `'high' | 'low'` defaulting to `'high'`. This field controls debris particle count scaling across all destructible props.

#### Scenario: Default quality is high
- **WHEN** GameConfig is imported without modification
- **THEN** `GameConfig.PARTICLE_QUALITY` equals `'high'`
