// ============================================================
// StageData.ts — Plain TypeScript type definitions for all
// stage-related data structures.
// @spec FR-SD-01 StageData type definitions
// ============================================================

/** One tiling parallax background layer. */
export interface ParallaxLayerDef {
  /** Phaser texture key for this layer's TileSprite. */
  textureKey: string;
  /** Scroll speed relative to the camera movement.
   *  0 = static background, 1 = moves at same speed as camera. */
  speedFactor: number;
  /** Render depth. Higher values appear in front. */
  depth: number;
}

/** A world-space line that, when crossed by the camera, locks scroll and
 *  activates the matching spawn zone. */
export interface ScrollTriggerDef {
  /** World X coordinate (px) at which the trigger fires. */
  worldX: number;
  /** ID of the SpawnZoneData to activate. Must match a SpawnZoneData.id. */
  zoneId: string;
}

/** Entry type describing one wave of enemies to spawn within a zone. */
export interface SpawnEntryDef {
  /** Enemy archetype key (e.g. 'punk', 'knife-guy'). */
  archetype: string;
  /** Number of enemies of this archetype to spawn. */
  count: number;
  /** Delay (ms) between each successive enemy of this entry. */
  staggerDelayMs: number;
}

/** A defined region of the stage where enemies spawn. */
export interface SpawnZoneData {
  /** Unique identifier used by ScrollTriggerDef.zoneId. */
  id: string;
  /** Spawn entries in the order they should be triggered. */
  entries: SpawnEntryDef[];
}

/** Types of items a prop can drop on destruction. */
export type ItemType = 'health' | 'score' | null;

/** One interactive destructible prop placed in the stage. */
export interface PropDef {
  /** World X position (px). */
  worldX: number;
  /** World Y position (px) — typically ground-plane centre. */
  worldY: number;
  /** Prop subtype (maps to a texture key). */
  type: 'barrel' | 'crate' | 'dumpster';
  /** Hit-points before the prop is destroyed. */
  hp: number;
  /** Item to spawn on destruction, or null for no drop. */
  dropItemType: ItemType;
  /** Probability (0.0–1.0) that an item drops when the prop is destroyed. */
  dropChance: number;
}

/** Complete data for one stage. */
export interface StageData {
  /** 1-based stage index. */
  id: 1 | 2 | 3;
  /** Total scrollable width in world-space pixels. */
  stageWidth: number;
  /** Top Y boundary of the walkable ground plane (screen-y). */
  groundTop: number;
  /** Bottom Y boundary of the walkable ground plane (screen-y). */
  groundBottom: number;
  /** Parallax background layers (at least 3, rearmost first). */
  layers: ParallaxLayerDef[];
  /** Camera scroll-lock triggers, sorted by worldX ascending. */
  scrollTriggers: ScrollTriggerDef[];
  /** Spawn zones referenced by scrollTriggers. */
  spawnZones: SpawnZoneData[];
  /** Destructible props placed throughout the stage. */
  props: PropDef[];
}
