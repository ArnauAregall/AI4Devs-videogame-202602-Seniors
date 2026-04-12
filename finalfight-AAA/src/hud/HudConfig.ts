/**
 * All HUD layout and style constants — single source of truth.
 * No magic numbers should appear in HUD component files.
 *
 * @spec hud
 */

// ── Health bar colours (Phaser hex format 0xRRGGBB) ─────────────────────────
export const HUD_HEALTH_GREEN  = 0x22cc44;
export const HUD_HEALTH_YELLOW = 0xffcc00;
export const HUD_HEALTH_RED    = 0xff2222;
/** Fraction at or below which bar turns yellow. */
export const HUD_HEALTH_YELLOW_THRESHOLD = 0.5;
/** Fraction at or below which bar turns red. */
export const HUD_HEALTH_RED_THRESHOLD    = 0.25;

// ── Timer ────────────────────────────────────────────────────────────────────
export const HUD_TIMER_WARNING_SECONDS = 30;
export const HUD_TIMER_WARNING_COLOUR  = 0xff2222;
export const HUD_TIMER_COLOUR_NORMAL   = '#ffffff';
export const HUD_TIMER_START_SECONDS   = 180;

// ── Boss bar ─────────────────────────────────────────────────────────────────
export const HUD_BOSS_BAR_Y      = 210;
export const HUD_BOSS_BAR_WIDTH  = 280;
export const HUD_BOSS_BAR_HEIGHT = 7;

// ── Layout positions (px on 384×224 canvas) ──────────────────────────────────
export const HUD_HEALTH_BAR_X      = 8;
export const HUD_HEALTH_BAR_Y      = 8;
export const HUD_HEALTH_BAR_WIDTH  = 100;
export const HUD_HEALTH_BAR_HEIGHT = 7;

export const HUD_SCORE_X = 376;   // right edge
export const HUD_SCORE_Y = 4;

export const HUD_LIVES_X = 8;
export const HUD_LIVES_Y = 18;

export const HUD_TIMER_X = 192;   // centre
export const HUD_TIMER_Y = 4;

export const HUD_COMBO_X = 280;
export const HUD_COMBO_Y = 60;

export const HUD_SPECIAL_X      = 8;
export const HUD_SPECIAL_Y      = 30;
export const HUD_SPECIAL_WIDTH  = 40;
export const HUD_SPECIAL_HEIGHT = 4;

// ── Font ─────────────────────────────────────────────────────────────────────
export const HUD_FONT_FAMILY      = 'Arial Black';
export const HUD_FONT_SIZE_SMALL  = '6px';
export const HUD_FONT_SIZE_NORMAL = '8px';
export const HUD_FONT_SIZE_LARGE  = '12px';

// ── Combo ────────────────────────────────────────────────────────────────────
export const HUD_COMBO_MIN_COUNT = 2;

// ── Continues / Leaderboard ──────────────────────────────────────────────────
export const HUD_MAX_CONTINUES               = 3;
export const HUD_LEADERBOARD_MAX_ENTRIES     = 10;
export const HUD_LEADERBOARD_NAME_MAX_LENGTH = 10;
export const HUD_LEADERBOARD_STORAGE_KEY     = 'finalfight_leaderboard';

// ── Score per enemy archetype ────────────────────────────────────────────────
export const HUD_SCORE_BRAWLER       = 100;
export const HUD_SCORE_RUSHER        = 150;
export const HUD_SCORE_KNIFE_THROWER = 200;
export const HUD_SCORE_BOSS          = 1000;

// ── Render depth ─────────────────────────────────────────────────────────────
/** All HUD objects render above every game layer at this depth. */
export const HUD_DEPTH = 9999;

// ── Special cooldown colours ─────────────────────────────────────────────────
export const HUD_SPECIAL_COLOUR_READY    = 0x22aaff;
export const HUD_SPECIAL_COLOUR_CHARGING = 0x336688;
