## 1. Configuration & Asset Keys

- [x] 1.1 Add `PARTICLE_QUALITY`, `DEBRIS_PARTICLE_COUNT`, `DEBRIS_PARTICLE_GRAVITY_Y`, `DEBRIS_PARTICLE_LIFESPAN_MS`, and `PROP_DUMPSTER_HP` constants to `GameConfig.ts`
- [x] 1.2 Add destruction animation and debris particle texture asset keys to `AssetKeys.ts`

## 2. DestructibleProp Refactor

- [x] 2.1 Convert `_sprite` from `Phaser.GameObjects.Image` to `Phaser.GameObjects.Sprite` and update damage-state frame references
- [x] 2.2 Replace tween-based `_destroy()` with destruction animation playback via `sprite.play()` and `animationcomplete` callback
- [x] 2.3 Return zero-size `hurtboxRect` when `_dead` is true to prevent post-destruction collision
- [x] 2.4 Add dumpster subtype support in constructor texture selection

## 3. Destruction Particles

- [x] 3.1 On `animationcomplete`, create a one-shot `ParticleEmitter` with `explode(quantity)` at the prop's screen position
- [x] 3.2 Apply quality scaling: multiply base count by 0.5 (floored) when `GameConfig.PARTICLE_QUALITY` is `'low'`
- [x] 3.3 Configure particle gravity-y and lifespan from GameConfig constants

## 4. Asset Loading

- [x] 4.1 Register destruction spritesheet and particle texture loads in `Preloader.ts`

## 5. Tests

- [x] 5.1 Update `DestructibleProp.test.ts` to verify destruction animation playback instead of tween
- [x] 5.2 Add test: hurtboxRect returns zero-size rect after destruction starts
- [x] 5.3 Add test: particle emitter explode called with correct count on high quality
- [x] 5.4 Add test: particle count halved when quality is low
- [x] 5.5 Add test: dumpster subtype instantiation
