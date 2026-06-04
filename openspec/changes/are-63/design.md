## Context

`DestructibleProp` currently uses a tween-based destruction (scale-up + fade-out over ~350ms). Props have no physics body (they use `scene.add.image`); collision is handled via screen-space hurtbox rect overlap checks in `CombatSystem`. The ticket requires a frame-based destruction animation, debris particles on completion, and quality-based particle scaling. The game uses Phaser 3 with a fixed-timestep loop and no Arcade physics bodies on props.

## Goals / Non-Goals

**Goals:**
- Replace tween destruction with a multi-frame spritesheet animation
- Emit debris particles after the final destruction frame
- Add a `particleQuality` config (`'high' | 'low'`) that caps particle count at 50% on Low
- Ensure the hurtbox rect returns null / is ignored after destruction starts (no collision post-death)
- Support dumpster as a third prop subtype

**Non-Goals:**
- Adding Arcade physics bodies to props (current screen-space rect system stays)
- Item drops (already handled by FR-DP-04)
- Intermediate damage-state animations (barrel-damage-states spec covers those)

## Decisions

### 1. Use Phaser Sprite with animation instead of Image + tweens

**Decision:** Convert `_sprite` from `Phaser.GameObjects.Image` to `Phaser.GameObjects.Sprite` so we can call `sprite.play()` with a destruction animation key.

**Rationale:** Sprites support frame-based animation natively. The animation complete callback provides the exact timing to remove the hurtbox and emit particles. Alternatives considered: chained tweens with frame swaps (current approach, lacks true frame animation), or manual frame advancement in fixedUpdate (unnecessary complexity).

### 2. Particle emission via Phaser ParticleEmitter (one-shot)

**Decision:** On destruction animation complete, create a one-shot `Phaser.GameObjects.Particles.ParticleEmitter` with a configured quantity. Use `emitter.explode(quantity)` then let the emitter self-destroy after all particles expire.

**Rationale:** Phaser 3.60+ merged particle manager into a single class. One-shot explode is the simplest approach for debris bursts with no persistent emitter overhead.

### 3. Quality setting lives in GameConfig as a runtime-mutable value

**Decision:** Add `PARTICLE_QUALITY: 'high' as 'high' | 'low'` to GameConfig. At emission time, read the setting and multiply the base count by 0.5 if `'low'`.

**Rationale:** GameConfig is already the central constants file. Making it a simple read at emission time avoids introducing a settings registry. The value could later be wired to a pause-menu toggle.

### 4. Hurtbox returns invalid rect after destruction starts

**Decision:** When `_dead` is true, `hurtboxRect` getter returns `{ x: 0, y: 0, w: 0, h: 0 }` (zero-size rect that won't overlap anything). CombatSystem already skips zero-dimension rects.

**Rationale:** Simpler than adding null checks throughout the combat overlap loop. The existing pattern in CombatSystem ignores zero-width/height hitboxes.

## Risks / Trade-offs

- [Risk] Particle burst may cause frame drop on very low-end devices even at 50% → Mitigation: cap max particle count constant to a conservative value (e.g., 12 base, 6 on Low).
- [Risk] Converting Image to Sprite may break barrel-damage-states frame references → Mitigation: Sprites still support `setFrame()` for damage states; the destruction animation uses a separate animation key played only after final hit.
- [Risk] Dumpster subtype has no dedicated asset → Mitigation: Use barrel asset as placeholder (same pattern as crate), documented in AssetKeys.
