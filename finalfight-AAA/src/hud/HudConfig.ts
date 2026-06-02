/**
 * All HUD layout and style constants — single source of truth.
 * No magic numbers should appear in HUD component files.
 *
 * Designers: you can safely change any value in this file to tune the HUD
 * appearance without modifying component logic. Changes take effect
 * immediately on the next build.
 *
 * @spec hud
 */

// ── Health bar colours (Phaser hex format 0xRRGGBB) ─────────────────────────
export const HUD_HEALTH_GREEN  = 0x22cc44;
export const HUD_HEALTH_YELLOW = 0xffcc00;
export const HUD_HEALTH_RED    = 0xff2222;

/**
 * HP percentage (as a 0–1 fraction) at or below which the health bar turns yellow.
 *
 * Example: 0.5 means the bar turns yellow when the player has 50 % HP or less.
 * Designer-tunable — changing this value here affects all health bar colour
 * behaviour with no other code changes required.
 */
export const HUD_HEALTH_YELLOW_THRESHOLD = 0.5;

/**
 * HP percentage (as a 0–1 fraction) at or below which the health bar turns red.
 *
 * Example: 0.25 means the bar turns red when the player has 25 % HP or less.
 * Designer-tunable — changing this value here affects all health bar colour
 * behaviour with no other code changes required.
 */
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
