// ============================================================
// stage1Data.ts — Stage 1 static data (Streets of Fight theme)
// @spec FR-SD-02 Stage data constants
// ============================================================
import {
  ASSET_KEY_CYBERPUNK_LAYER_1,
  ASSET_KEY_CYBERPUNK_LAYER_2,
  ASSET_KEY_CYBERPUNK_LAYER_3,
  ASSET_KEY_CYBERPUNK_LAYER_4,
  ASSET_KEY_CYBERPUNK_LAYER_5,
  ASSET_KEY_CYBERPUNK_LAYER_6,
  ASSET_KEY_PROP_BARREL,
  ASSET_KEY_PROP_HYDRANT,
} from '../assets/AssetKeys';
import { GameConfig } from '../config/GameConfig';
import type { StageData } from '../stage/StageData';

const groundMidY = (GameConfig.GROUND_TOP + GameConfig.GROUND_BOTTOM) / 2;

export const stage1Data: StageData = {
  id: 1,
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
    { worldX: 1500, zoneId: 'zone-1a' },
    { worldX: 3200, zoneId: 'zone-1b' },
    { worldX: 5000, zoneId: 'zone-1c' },
  ],
  spawnZones: [
    {
      id: 'zone-1a',
      entries: [
        { archetype: 'brawler', count: 2, staggerDelayMs: 500 },
      ],
    },
    {
      id: 'zone-1b',
      entries: [
        { archetype: 'brawler', count: 3, staggerDelayMs: 400 },
      ],
    },
    {
      id: 'zone-1c',
      entries: [
        { archetype: 'brawler', count: 4, staggerDelayMs: 300 },
      ],
    },
  ],
  props: [
    { worldX: 800,  worldY: groundMidY, type: 'barrel', hp: GameConfig.PROP_BARREL_HP, dropItemType: 'health' },
    { worldX: 1200, worldY: groundMidY, type: 'crate',  hp: GameConfig.PROP_CRATE_HP,  dropItemType: null },
    { worldX: 2400, worldY: groundMidY, type: 'barrel', hp: GameConfig.PROP_BARREL_HP, dropItemType: 'score' },
    { worldX: 3800, worldY: groundMidY, type: 'crate',  hp: GameConfig.PROP_CRATE_HP,  dropItemType: 'health' },
    { worldX: 4500, worldY: groundMidY, type: 'barrel', hp: GameConfig.PROP_BARREL_HP, dropItemType: null },
  ],
} as const;

// Suppress "unused import" warnings for keys only used in texture lookups
void ASSET_KEY_PROP_BARREL;
void ASSET_KEY_PROP_HYDRANT;
