// ============================================================
// AssetKeys.ts — Single source of truth for all Phaser texture
// keys and their relative paths under public/assets/.
//
// Rules:
//  1. Never reference itch-io-resources/ paths here or anywhere
//     in game source code.
//  2. All Phaser load calls must use keys from this file.
//  3. Add an entry here before using any new asset in game code.
// ============================================================

// ------------------------------------------------------------
// Player — Brawler Girl (source: streets-of-fight)
// ------------------------------------------------------------

// Player — Brawler Girl (source: streets-of-fight)
// Verified frame size: 96×63 px (all 9 spritesheets share the same height)

export const ASSET_KEY_PLAYER_IDLE       = 'player-idle';
export const ASSET_KEY_PLAYER_WALK       = 'player-walk';
export const ASSET_KEY_PLAYER_JUMP       = 'player-jump';
export const ASSET_KEY_PLAYER_JAB        = 'player-jab';
export const ASSET_KEY_PLAYER_PUNCH      = 'player-punch';
export const ASSET_KEY_PLAYER_KICK       = 'player-kick';
export const ASSET_KEY_PLAYER_JUMP_KICK  = 'player-jump-kick';
export const ASSET_KEY_PLAYER_DIVE_KICK  = 'player-dive-kick';
export const ASSET_KEY_PLAYER_HURT       = 'player-hurt';
// Missing animations — no source sprite available; use hurt as placeholder until assets arrive
export const ASSET_KEY_PLAYER_KNOCKDOWN  = 'player-knockdown';
export const ASSET_KEY_PLAYER_GETUP      = 'player-getup';
export const ASSET_KEY_PLAYER_GRAB       = 'player-grab';
export const ASSET_KEY_PLAYER_SPECIAL    = 'player-special';

// ------------------------------------------------------------
// Enemy — Punk archetype (source: streets-of-fight)
// ------------------------------------------------------------

export const ASSET_KEY_PUNK_IDLE   = 'punk-idle';
export const ASSET_KEY_PUNK_WALK   = 'punk-walk';
export const ASSET_KEY_PUNK_PUNCH  = 'punk-punch';
export const ASSET_KEY_PUNK_HURT   = 'punk-hurt';
// Placeholder — no source death sprite available; reuses hurt sheet until death asset is sourced
export const ASSET_KEY_PUNK_DEATH  = 'punk-death';

// ------------------------------------------------------------
// Enemy — Boss (Brute Arms) (source: brute-arms-boss)
// Verified frame sizes from actual PNG dimensions:
//   idle:     100×101 px (8 frames — 800×101 sheet)
//   walk:     100×100 px (6 frames — 600×100 sheet)
//   attack-1: 160×128 px (7 frames — 1120×128 sheet)
//   attack-2: 160×128 px (5 frames —  800×128 sheet)
//   attack-3: 160×128 px (5 frames —  800×128 sheet)
//   attack-4: 160×128 px (8 frames — 1280×128 sheet)
//   hurt:     160×128 px (8 frames — 1280×128 sheet)
//   jump:     120×128 px (10 frames — 1200×128 sheet)
// No dedicated death sheet — boss-hurt used as placeholder.
// ------------------------------------------------------------

export const ASSET_KEY_BOSS_IDLE      = 'boss-idle';
export const ASSET_KEY_BOSS_WALK      = 'boss-walk';
export const ASSET_KEY_BOSS_ATTACK_1  = 'boss-attack-1';
export const ASSET_KEY_BOSS_ATTACK_2  = 'boss-attack-2';
export const ASSET_KEY_BOSS_ATTACK_3  = 'boss-attack-3';
export const ASSET_KEY_BOSS_ATTACK_4  = 'boss-attack-4';
export const ASSET_KEY_BOSS_HURT      = 'boss-hurt';
export const ASSET_KEY_BOSS_JUMP      = 'boss-jump';
// Placeholder — no death sheet; reuses hurt until a dedicated asset is sourced
export const ASSET_KEY_BOSS_DEATH     = 'boss-death';

// ------------------------------------------------------------
// Stage layers — Streets of Fight (source: streets-of-fight)
// ------------------------------------------------------------

export const ASSET_KEY_STAGE_BACK     = 'stage-back';
export const ASSET_KEY_STAGE_FORE     = 'stage-fore';
export const ASSET_KEY_STAGE_TILESET  = 'stage-tileset';

// ------------------------------------------------------------
// Stage layers — Cyberpunk Platformer (source: cyberpunk-platformer-worldstarter)
// 6 tiling parallax layers at 512×288
// ------------------------------------------------------------

export const ASSET_KEY_CYBERPUNK_LAYER_1 = 'cyberpunk-layer-1';
export const ASSET_KEY_CYBERPUNK_LAYER_2 = 'cyberpunk-layer-2';
export const ASSET_KEY_CYBERPUNK_LAYER_3 = 'cyberpunk-layer-3';
export const ASSET_KEY_CYBERPUNK_LAYER_4 = 'cyberpunk-layer-4';
export const ASSET_KEY_CYBERPUNK_LAYER_5 = 'cyberpunk-layer-5';
export const ASSET_KEY_CYBERPUNK_LAYER_6 = 'cyberpunk-layer-6';

// ------------------------------------------------------------
// Stage props (source: streets-of-fight)
// ------------------------------------------------------------

export const ASSET_KEY_PROP_BARREL        = 'prop-barrel';
export const ASSET_KEY_PROP_BARREL_DESTROY = 'prop-barrel-destroy';
export const ASSET_KEY_PROP_DEBRIS        = 'prop-debris';
export const ASSET_KEY_PROP_CAR           = 'prop-car';
export const ASSET_KEY_PROP_HYDRANT       = 'prop-hydrant';
export const ASSET_KEY_PROP_BANNER_HOR_1  = 'prop-banner-hor-1';
export const ASSET_KEY_PROP_BANNER_HOR_2  = 'prop-banner-hor-2';
export const ASSET_KEY_PROP_ETHEREUM_1    = 'prop-ethereum-1';
export const ASSET_KEY_PROP_ETHEREUM_2    = 'prop-ethereum-2';
export const ASSET_KEY_PROP_SUSHI_1       = 'prop-sushi-1';
export const ASSET_KEY_PROP_SUSHI_2       = 'prop-sushi-2';

// ------------------------------------------------------------
// Items — partial (source: cyberpunk-platformer-worldstarter)
// PARTIAL: decorations.png is a 336×160 tileset sheet.
// Individual item frames must be extracted or loaded as a
// spritesheet once frame dimensions are confirmed.
// ------------------------------------------------------------

export const ASSET_KEY_CYBERPUNK_DECORATIONS = 'cyberpunk-decorations';

// ------------------------------------------------------------
// Common (source: streets-of-fight)
// ------------------------------------------------------------

export const ASSET_KEY_COMMON_SHADOW = 'common-shadow';

// ------------------------------------------------------------
// UI / Boot — loaded by BootScene only (not part of ASSET_PATH)
// ------------------------------------------------------------

export const ASSET_KEY_LOADING_BG  = 'loading-bg';
/** Path relative to public/assets/, used by Boot scene. */
export const ASSET_PATH_LOADING_BG = 'bg.png';

// ============================================================
// ASSET_PATH — maps every key to its relative path under
// public/assets/. Used as the second argument to Phaser load
// calls in the Preload scene.
// ============================================================

export const ASSET_PATH: Readonly<Record<string, string>> = {
  // Player
  [ASSET_KEY_PLAYER_IDLE]:       'player/player-idle.png',
  [ASSET_KEY_PLAYER_WALK]:       'player/player-walk.png',
  [ASSET_KEY_PLAYER_JUMP]:       'player/player-jump.png',
  [ASSET_KEY_PLAYER_JAB]:        'player/player-jab.png',
  [ASSET_KEY_PLAYER_PUNCH]:      'player/player-punch.png',
  [ASSET_KEY_PLAYER_KICK]:       'player/player-kick.png',
  [ASSET_KEY_PLAYER_JUMP_KICK]:  'player/player-jump-kick.png',
  [ASSET_KEY_PLAYER_DIVE_KICK]:  'player/player-dive-kick.png',
  [ASSET_KEY_PLAYER_HURT]:       'player/player-hurt.png',
  // Placeholder paths — reuse hurt.png until dedicated assets are sourced (assets.md Open Questions 1–4)
  [ASSET_KEY_PLAYER_KNOCKDOWN]:  'player/player-hurt.png',
  [ASSET_KEY_PLAYER_GETUP]:      'player/player-hurt.png',
  [ASSET_KEY_PLAYER_GRAB]:       'player/player-hurt.png',
  [ASSET_KEY_PLAYER_SPECIAL]:    'player/player-hurt.png',
  // Enemy Punk
  [ASSET_KEY_PUNK_IDLE]:   'enemies/punk/punk-idle.png',
  [ASSET_KEY_PUNK_WALK]:   'enemies/punk/punk-walk.png',
  [ASSET_KEY_PUNK_PUNCH]:  'enemies/punk/punk-punch.png',
  [ASSET_KEY_PUNK_HURT]:   'enemies/punk/punk-hurt.png',
  // Placeholder: reuses hurt sheet until a dedicated death sprite is sourced
  [ASSET_KEY_PUNK_DEATH]:  'enemies/punk/punk-hurt.png',
  // Enemy Boss (Brute Arms)
  [ASSET_KEY_BOSS_IDLE]:     'boss/boss-idle.png',
  [ASSET_KEY_BOSS_WALK]:     'boss/boss-walk.png',
  [ASSET_KEY_BOSS_ATTACK_1]: 'boss/boss-attack-1.png',
  [ASSET_KEY_BOSS_ATTACK_2]: 'boss/boss-attack-2.png',
  [ASSET_KEY_BOSS_ATTACK_3]: 'boss/boss-attack-3.png',
  [ASSET_KEY_BOSS_ATTACK_4]: 'boss/boss-attack-4.png',
  [ASSET_KEY_BOSS_HURT]:     'boss/boss-hurt.png',
  [ASSET_KEY_BOSS_JUMP]:     'boss/boss-jump.png',
  // Placeholder: reuses hurt until dedicated death asset is sourced
  [ASSET_KEY_BOSS_DEATH]:    'boss/boss-hurt.png',
  // Stage layers — Streets of Fight
  [ASSET_KEY_STAGE_BACK]:     'stage/layers/stage-back.png',
  [ASSET_KEY_STAGE_FORE]:     'stage/layers/stage-fore.png',
  [ASSET_KEY_STAGE_TILESET]:  'stage/layers/stage-tileset.png',
  // Stage layers — Cyberpunk
  [ASSET_KEY_CYBERPUNK_LAYER_1]: 'stage/layers/cyberpunk-layer-1.png',
  [ASSET_KEY_CYBERPUNK_LAYER_2]: 'stage/layers/cyberpunk-layer-2.png',
  [ASSET_KEY_CYBERPUNK_LAYER_3]: 'stage/layers/cyberpunk-layer-3.png',
  [ASSET_KEY_CYBERPUNK_LAYER_4]: 'stage/layers/cyberpunk-layer-4.png',
  [ASSET_KEY_CYBERPUNK_LAYER_5]: 'stage/layers/cyberpunk-layer-5.png',
  [ASSET_KEY_CYBERPUNK_LAYER_6]: 'stage/layers/cyberpunk-layer-6.png',
  // Props
  [ASSET_KEY_PROP_BARREL]:        'stage/props/prop-barrel.png',
  [ASSET_KEY_PROP_BARREL_DESTROY]: 'stage/props/prop-barrel-destroy.png',
  [ASSET_KEY_PROP_DEBRIS]:        'stage/props/prop-debris.png',
  [ASSET_KEY_PROP_CAR]:           'stage/props/prop-car.png',
  [ASSET_KEY_PROP_HYDRANT]:       'stage/props/prop-hydrant.png',
  [ASSET_KEY_PROP_BANNER_HOR_1]:  'stage/props/prop-banner-hor-1.png',
  [ASSET_KEY_PROP_BANNER_HOR_2]:  'stage/props/prop-banner-hor-2.png',
  [ASSET_KEY_PROP_ETHEREUM_1]:    'stage/props/prop-ethereum-1.png',
  [ASSET_KEY_PROP_ETHEREUM_2]:    'stage/props/prop-ethereum-2.png',
  [ASSET_KEY_PROP_SUSHI_1]:       'stage/props/prop-sushi-1.png',
  [ASSET_KEY_PROP_SUSHI_2]:       'stage/props/prop-sushi-2.png',
  // Items (partial)
  [ASSET_KEY_CYBERPUNK_DECORATIONS]: 'items/cyberpunk-decorations.png',
  // Common
  [ASSET_KEY_COMMON_SHADOW]: 'common/common-shadow.png',
};

// ============================================================
// ASSET_FRAME_CONFIG — frame dimensions for spritesheets.
// Used as { frameWidth, frameHeight } in this.load.spritesheet().
// Dimensions derived from actual PNG size ÷ known frame count.
// ============================================================

export interface FrameConfig {
  readonly frameWidth: number;
  readonly frameHeight: number;
}

export const ASSET_FRAME_CONFIG: Readonly<Record<string, FrameConfig>> = {
  // Player — Brawler Girl (verified: 96×63 px per frame)
  [ASSET_KEY_PLAYER_IDLE]:      { frameWidth: 96, frameHeight: 63 },  // 4 frames
  [ASSET_KEY_PLAYER_WALK]:      { frameWidth: 96, frameHeight: 63 },  // 10 frames
  [ASSET_KEY_PLAYER_JUMP]:      { frameWidth: 96, frameHeight: 63 },  // 4 frames
  [ASSET_KEY_PLAYER_JAB]:       { frameWidth: 96, frameHeight: 63 },  // 3 frames
  [ASSET_KEY_PLAYER_PUNCH]:     { frameWidth: 96, frameHeight: 63 },  // 3 frames
  [ASSET_KEY_PLAYER_KICK]:      { frameWidth: 96, frameHeight: 63 },  // 5 frames
  [ASSET_KEY_PLAYER_JUMP_KICK]: { frameWidth: 96, frameHeight: 63 },  // 3 frames
  [ASSET_KEY_PLAYER_DIVE_KICK]: { frameWidth: 96, frameHeight: 63 },  // 5 frames
  [ASSET_KEY_PLAYER_HURT]:      { frameWidth: 96, frameHeight: 63 },  // 2 frames
  // Placeholder fallback keys — mapped to hurt.png until real assets arrive
  [ASSET_KEY_PLAYER_KNOCKDOWN]: { frameWidth: 96, frameHeight: 63 },
  [ASSET_KEY_PLAYER_GETUP]:     { frameWidth: 96, frameHeight: 63 },
  [ASSET_KEY_PLAYER_GRAB]:      { frameWidth: 96, frameHeight: 63 },
  [ASSET_KEY_PLAYER_SPECIAL]:   { frameWidth: 96, frameHeight: 63 },
  // Enemy Punk — verified 96×63 px per frame (same sheet convention as player)
  [ASSET_KEY_PUNK_IDLE]:  { frameWidth: 96, frameHeight: 63 }, // 4 frames (384÷96)
  [ASSET_KEY_PUNK_WALK]:  { frameWidth: 96, frameHeight: 63 }, // 4 frames (384÷96)
  [ASSET_KEY_PUNK_PUNCH]: { frameWidth: 96, frameHeight: 63 }, // 3 frames (288÷96)
  [ASSET_KEY_PUNK_HURT]:  { frameWidth: 96, frameHeight: 63 }, // 4 frames (384÷96)
  // Placeholder: same dimensions as hurt (reuses hurt sheet)
  [ASSET_KEY_PUNK_DEATH]: { frameWidth: 96, frameHeight: 63 }, // 4 frames (384÷96)
  // Enemy Boss (Brute Arms) — verified from actual PNG dimensions
  [ASSET_KEY_BOSS_IDLE]:     { frameWidth: 100, frameHeight: 101 }, //  8 frames (800÷100)
  [ASSET_KEY_BOSS_WALK]:     { frameWidth: 100, frameHeight: 100 }, //  6 frames (600÷100)
  [ASSET_KEY_BOSS_ATTACK_1]: { frameWidth: 160, frameHeight: 128 }, //  7 frames (1120÷160)
  [ASSET_KEY_BOSS_ATTACK_2]: { frameWidth: 160, frameHeight: 128 }, //  5 frames  (800÷160)
  [ASSET_KEY_BOSS_ATTACK_3]: { frameWidth: 160, frameHeight: 128 }, //  5 frames  (800÷160)
  [ASSET_KEY_BOSS_ATTACK_4]: { frameWidth: 160, frameHeight: 128 }, //  8 frames (1280÷160)
  [ASSET_KEY_BOSS_HURT]:     { frameWidth: 160, frameHeight: 128 }, //  8 frames (1280÷160)
  [ASSET_KEY_BOSS_JUMP]:     { frameWidth: 120, frameHeight: 128 }, // 10 frames (1200÷120)
  // Placeholder: same dimensions as hurt (reuses hurt sheet)
  [ASSET_KEY_BOSS_DEATH]:    { frameWidth: 160, frameHeight: 128 }, //  8 frames (1280÷160)
  // Cyberpunk decorations — 336×160 tileset; frame size TBD after visual inspection
  [ASSET_KEY_CYBERPUNK_DECORATIONS]: { frameWidth: 16, frameHeight: 16 }, // TODO: verify
  // Props — barrel spritesheet: frame 0 = intact, frame 1 = crushed (64×48, 2 frames of 32×48)
  [ASSET_KEY_PROP_BARREL]: { frameWidth: 32, frameHeight: 48 }, // 2 frames
  // Props — barrel destruction spritesheet (placeholder: same frame size as barrel)
  [ASSET_KEY_PROP_BARREL_DESTROY]: { frameWidth: 32, frameHeight: 48 },
};
