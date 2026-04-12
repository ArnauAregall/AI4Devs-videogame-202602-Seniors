// ============================================================
// stage3Data.ts — Stage 3 static data (final stage)
// @spec FR-SD-02 Stage data constants
// ============================================================
import {
  ASSET_KEY_CYBERPUNK_LAYER_1,
  ASSET_KEY_CYBERPUNK_LAYER_2,
  ASSET_KEY_CYBERPUNK_LAYER_3,
  ASSET_KEY_CYBERPUNK_LAYER_4,
  ASSET_KEY_CYBERPUNK_LAYER_5,
  ASSET_KEY_CYBERPUNK_LAYER_6,
} from '../assets/AssetKeys';
import { GameConfig } from '../config/GameConfig';
import type { StageData } from '../stage/StageData';

const groundMidY = (GameConfig.GROUND_TOP + GameConfig.GROUND_BOTTOM) / 2;

export const stage3Data: StageData = {
  id: 3,
  stageWidth: 7000,
  groundTop: GameConfig.GROUND_TOP,
  groundBottom: GameConfig.GROUND_BOTTOM,
  layers: [
    { textureKey: ASSET_KEY_CYBERPUNK_LAYER_1, speedFactor: 0.05, depth: 0 },
    { textureKey: ASSET_KEY_CYBERPUNK_LAYER_2, speedFactor: 0.15, depth: 1 },
    { textureKey: ASSET_KEY_CYBERPUNK_LAYER_3, speedFactor: 0.25, depth: 2 },
    { textureKey: ASSET_KEY_CYBERPUNK_LAYER_4, speedFactor: 0.40, depth: 3 },
    { textureKey: ASSET_KEY_CYBERPUNK_LAYER_5, speedFactor: 0.60, depth: 4 },
    { textureKey: ASSET_KEY_CYBERPUNK_LAYER_6, speedFactor: 0.80, depth: 5 },
  ],
  scrollTriggers: [
    { worldX: 1300, zoneId: 'zone-3a' },
    { worldX: 2600, zoneId: 'zone-3b' },
    { worldX: 4000, zoneId: 'zone-3c' },
    { worldX: 5200, zoneId: 'zone-3d' },
    { worldX: 6400, zoneId: 'zone-3e' },
  ],
  spawnZones: [
    {
      id: 'zone-3a',
      entries: [
        { archetype: 'punk', count: 3, staggerDelayMs: 400 },
      ],
    },
    {
      id: 'zone-3b',
      entries: [
        { archetype: 'punk', count: 4, staggerDelayMs: 350 },
      ],
    },
    {
      id: 'zone-3c',
      entries: [
        { archetype: 'punk', count: 4, staggerDelayMs: 300 },
        { archetype: 'punk', count: 2, staggerDelayMs: 500 },
      ],
    },
    {
      id: 'zone-3d',
      entries: [
        { archetype: 'punk', count: 5, staggerDelayMs: 250 },
      ],
    },
    {
      id: 'zone-3e',
      entries: [
        { archetype: 'punk', count: 6, staggerDelayMs: 200 },
      ],
    },
  ],
  props: [
    { worldX: 600,  worldY: groundMidY, type: 'barrel', hp: GameConfig.PROP_BARREL_HP, dropItemType: 'health' },
    { worldX: 1000, worldY: groundMidY, type: 'crate',  hp: GameConfig.PROP_CRATE_HP,  dropItemType: null },
    { worldX: 2000, worldY: groundMidY, type: 'barrel', hp: GameConfig.PROP_BARREL_HP, dropItemType: 'score' },
    { worldX: 3200, worldY: groundMidY, type: 'crate',  hp: GameConfig.PROP_CRATE_HP,  dropItemType: 'health' },
    { worldX: 4400, worldY: groundMidY, type: 'barrel', hp: GameConfig.PROP_BARREL_HP, dropItemType: null },
    { worldX: 5600, worldY: groundMidY, type: 'crate',  hp: GameConfig.PROP_CRATE_HP,  dropItemType: 'score' },
    { worldX: 6600, worldY: groundMidY, type: 'barrel', hp: GameConfig.PROP_BARREL_HP, dropItemType: 'health' },
  ],
} as const;
