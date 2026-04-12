// ============================================================
// stage2Data.ts — Stage 2 static data
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

export const stage2Data: StageData = {
  id: 2,
  stageWidth: 6000,
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
    { worldX: 1400, zoneId: 'zone-2a' },
    { worldX: 2800, zoneId: 'zone-2b' },
    { worldX: 4200, zoneId: 'zone-2c' },
    { worldX: 5400, zoneId: 'zone-2d' },
  ],
  spawnZones: [
    {
      id: 'zone-2a',
      entries: [
        { archetype: 'brawler', count: 3, staggerDelayMs: 450 },
      ],
    },
    {
      id: 'zone-2b',
      entries: [
        { archetype: 'brawler', count: 3, staggerDelayMs: 350 },
        { archetype: 'brawler', count: 2, staggerDelayMs: 600 },
      ],
    },
    {
      id: 'zone-2c',
      entries: [
        { archetype: 'brawler', count: 4, staggerDelayMs: 300 },
      ],
    },
    {
      id: 'zone-2d',
      entries: [
        { archetype: 'brawler', count: 5, staggerDelayMs: 250 },
      ],
    },
  ],
  props: [
    { worldX: 700,  worldY: groundMidY, type: 'barrel', hp: GameConfig.PROP_BARREL_HP, dropItemType: null },
    { worldX: 1100, worldY: groundMidY, type: 'crate',  hp: GameConfig.PROP_CRATE_HP,  dropItemType: 'health' },
    { worldX: 2200, worldY: groundMidY, type: 'barrel', hp: GameConfig.PROP_BARREL_HP, dropItemType: 'score' },
    { worldX: 3500, worldY: groundMidY, type: 'crate',  hp: GameConfig.PROP_CRATE_HP,  dropItemType: null },
    { worldX: 4700, worldY: groundMidY, type: 'barrel', hp: GameConfig.PROP_BARREL_HP, dropItemType: 'health' },
    { worldX: 5600, worldY: groundMidY, type: 'crate',  hp: GameConfig.PROP_CRATE_HP,  dropItemType: null },
  ],
} as const;
