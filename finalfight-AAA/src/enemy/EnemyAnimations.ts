/**
 * Shared animation registration helper for punk-archetype enemies.
 * All four archetypes (Brawler, Rusher, KnifeThrower, Boss) call this helper
 * once in their constructor. The guard prevents duplicate registration when
 * multiple enemies of the same archetype are spawned.
 *
 * @spec enemy-animation
 * @implements FR-EB-09
 */
import Phaser from 'phaser';
import {
  ASSET_KEY_PUNK_IDLE,
  ASSET_KEY_PUNK_WALK,
  ASSET_KEY_PUNK_PUNCH,
  ASSET_KEY_PUNK_HURT,
  ASSET_KEY_PUNK_DEATH,
} from '../assets/AssetKeys';
import {
  PUNK_ANIM_IDLE,   PUNK_ANIM_IDLE_FRAMES,   PUNK_ANIM_IDLE_FPS,
  PUNK_ANIM_WALK,   PUNK_ANIM_WALK_FRAMES,   PUNK_ANIM_WALK_FPS,
  PUNK_ANIM_ATTACK, PUNK_ANIM_ATTACK_FRAMES, PUNK_ANIM_ATTACK_FPS,
  PUNK_ANIM_HURT,   PUNK_ANIM_HURT_FRAMES,   PUNK_ANIM_HURT_FPS,
  PUNK_ANIM_DEATH,  PUNK_ANIM_DEATH_FRAMES,  PUNK_ANIM_DEATH_FPS,
} from './EnemyConfig';

/**
 * Register the five Punk animation clips with the given scene.
 * Idempotent: clips already registered are skipped. Safe to call from
 * every archetype constructor regardless of how many enemies exist.
 *
 * @spec FR-EB-09
 */
export function registerPunkAnims(scene: Phaser.Scene): void {
  const defs: Array<{ key: string; textureKey: string; frames: number; fps: number; repeat: number }> = [
    { key: PUNK_ANIM_IDLE,   textureKey: ASSET_KEY_PUNK_IDLE,   frames: PUNK_ANIM_IDLE_FRAMES,   fps: PUNK_ANIM_IDLE_FPS,   repeat: -1 },
    { key: PUNK_ANIM_WALK,   textureKey: ASSET_KEY_PUNK_WALK,   frames: PUNK_ANIM_WALK_FRAMES,   fps: PUNK_ANIM_WALK_FPS,   repeat: -1 },
    { key: PUNK_ANIM_ATTACK, textureKey: ASSET_KEY_PUNK_PUNCH,  frames: PUNK_ANIM_ATTACK_FRAMES, fps: PUNK_ANIM_ATTACK_FPS, repeat: 0  },
    { key: PUNK_ANIM_HURT,   textureKey: ASSET_KEY_PUNK_HURT,   frames: PUNK_ANIM_HURT_FRAMES,   fps: PUNK_ANIM_HURT_FPS,   repeat: 0  },
    { key: PUNK_ANIM_DEATH,  textureKey: ASSET_KEY_PUNK_DEATH,  frames: PUNK_ANIM_DEATH_FRAMES,  fps: PUNK_ANIM_DEATH_FPS,  repeat: 0  },
  ];

  for (const def of defs) {
    if (scene.anims.exists(def.key)) continue;
    scene.anims.create({
      key:       def.key,
      frames:    scene.anims.generateFrameNumbers(def.textureKey, { start: 0, end: def.frames - 1 }),
      frameRate: def.fps,
      repeat:    def.repeat,
    });
  }
}
