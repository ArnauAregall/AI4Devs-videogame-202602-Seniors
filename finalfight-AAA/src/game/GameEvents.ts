/**
 * Canonical event names emitted on the GameScene event bus.
 * All HUD components listen to these to stay decoupled from game systems.
 *
 * @spec hud
 */
export const GameEvents = {
  PLAYER_HEALTH_CHANGED:   'playerHealthChanged',
  PLAYER_LIVES_CHANGED:    'playerLivesChanged',
  SCORE_CHANGED:           'scoreChanged',
  BOSS_ARRIVED:            'bossArrived',
  BOSS_HEALTH_CHANGED:     'bossHealthChanged',
  COMBO_UPDATED:           'comboUpdated',
  SPECIAL_COOLDOWN_CHANGED:'specialCooldownChanged',
  TIMER_TICK:              'timerTick',
  STAGE_CLEARED:           'stageCleared',
  GAME_OVER:               'gameOver',
  PAUSE_TOGGLED:           'pauseToggled',
} as const;

export type GameEventPayloads = {
  [GameEvents.PLAYER_HEALTH_CHANGED]:   { current: number; max: number };
  [GameEvents.PLAYER_LIVES_CHANGED]:    { lives: number };
  [GameEvents.SCORE_CHANGED]:           { score: number; delta: number };
  [GameEvents.BOSS_ARRIVED]:            { maxHealth: number };
  [GameEvents.BOSS_HEALTH_CHANGED]:     { current: number; max: number };
  [GameEvents.COMBO_UPDATED]:           { count: number; windowActive: boolean };
  [GameEvents.SPECIAL_COOLDOWN_CHANGED]:{ fraction: number };
  [GameEvents.TIMER_TICK]:              { remaining: number };
  [GameEvents.STAGE_CLEARED]:           { score: number; timeBonus: number };
  [GameEvents.GAME_OVER]:               { score: number };
  [GameEvents.PAUSE_TOGGLED]:           { paused: boolean };
};
