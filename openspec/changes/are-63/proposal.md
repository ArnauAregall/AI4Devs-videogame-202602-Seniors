## Why

Destructible props currently use a tween-based destruction effect (scale + fade) but lack a proper frame-by-frame destruction animation, emit no debris particles, and have no particle quality scaling for low-end devices. The ticket requires props to play a multi-frame destruction animation before removing their physics body, emit configurable debris particles on destruction, and cap particle count to 50% when quality is set to Low to maintain 60fps.

## What Changes

- Extend `DestructibleProp` to play a destruction spritesheet animation (frame sequence) instead of the current scale/fade tween, removing the physics body only after the final animation frame completes.
- Add a debris particle emitter that fires on destruction completion with configurable particle count and gravity.
- Introduce a `particleQuality` setting (`'high' | 'low'`) in `GameConfig` that scales the debris particle count to 50% when set to `'low'`.
- Ensure no collision remains after the destruction animation finishes (physics body removed on final frame).
- Support dumpster as a third destructible prop subtype alongside barrel and crate.

## Capabilities

### New Capabilities
- `destruction-particles`: Debris particle emission on prop destruction with quality-based count scaling

### Modified Capabilities
- `destructible-prop`: Add destruction animation frame sequence playback, deferred physics body removal until final frame, and dumpster subtype support

## Impact

- `finalfight-AAA/src/stage/DestructibleProp.ts` — Major refactor: replace tween destruction with animation playback + particle emission
- `finalfight-AAA/src/config/GameConfig.ts` — Add particle quality setting, destruction particle constants, dumpster HP
- `finalfight-AAA/src/assets/AssetKeys.ts` — Add destruction animation and particle texture asset keys
- `finalfight-AAA/src/game/scenes/Preloader.ts` — Load destruction spritesheet and particle textures
- `finalfight-AAA/src/__tests__/DestructibleProp.test.ts` — Update tests for new destruction flow and particles
