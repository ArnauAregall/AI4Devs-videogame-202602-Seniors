/**
 * HudScene — fixed-camera overlay scene that renders all HUD components and
 * manages game-flow transitions (game-over, stage-clear, pause).
 *
 * Launched by GameScene.create() and listens on GameScene's event bus.
 *
 * @spec hud
 */
import { Scene }                   from 'phaser';
import { GameEvents }              from '../game/GameEvents';
import { HealthBar }               from './HealthBar';
import { BossHealthBar }           from './BossHealthBar';
import { ScoreDisplay }            from './ScoreDisplay';
import { LivesDisplay }            from './LivesDisplay';
import { ComboCounter }            from './ComboCounter';
import { TimerDisplay }            from './TimerDisplay';
import { SpecialCooldownDisplay }  from './SpecialCooldownDisplay';
import { LeaderboardStore }        from './LeaderboardStore';
import { HUD_LEADERBOARD_NAME_MAX_LENGTH } from './HudConfig';
import type { GameScene }          from '../game/scenes/GameScene';

export class HudScene extends Scene {
  private _healthBar!:       HealthBar;
  private _bossHealthBar!:   BossHealthBar;
  private _scoreDisplay!:    ScoreDisplay;
  private _livesDisplay!:    LivesDisplay;
  private _comboCounter!:    ComboCounter;
  private _timerDisplay!:    TimerDisplay;
  private _specialCooldown!: SpecialCooldownDisplay;
  private _leaderboard!:     LeaderboardStore;

  constructor() {
    super('HudScene');
  }

  create(): void {
    // Fix the HUD camera so it never scrolls with the game world.
    this.cameras.main.setScroll(0, 0);

    // Instantiate components.
    this._healthBar      = new HealthBar(this, 0, 1);
    this._bossHealthBar  = new BossHealthBar(this);
    this._scoreDisplay   = new ScoreDisplay(this);
    this._livesDisplay   = new LivesDisplay(this, 0);
    this._comboCounter   = new ComboCounter(this);
    this._timerDisplay   = new TimerDisplay(this);
    this._specialCooldown = new SpecialCooldownDisplay(this);
    this._leaderboard    = new LeaderboardStore();

    // Seed initial state from GameScene.
    const gs = this.scene.get('GameScene') as GameScene;
    if (gs) {
      const player = gs.getPlayer();
      if (player) {
        this._healthBar.update(player.hp, player.maxHp);
        this._livesDisplay.update(player.lives);
      }
    }

    // Wire GameScene event listeners.
    const emitter = this.scene.get('GameScene').events;

    emitter.on(GameEvents.PLAYER_HEALTH_CHANGED, ({ current, max }: { current: number; max: number }) => {
      this._healthBar.update(current, max);
    });

    emitter.on(GameEvents.PLAYER_LIVES_CHANGED, ({ lives }: { lives: number }) => {
      this._livesDisplay.update(lives);
    });

    emitter.on(GameEvents.SCORE_CHANGED, ({ score }: { score: number }) => {
      this._scoreDisplay.update(score);
    });

    emitter.on(GameEvents.BOSS_ARRIVED, ({ maxHealth }: { maxHealth: number }) => {
      this._bossHealthBar.show(maxHealth);
    });

    emitter.on(GameEvents.BOSS_HEALTH_CHANGED, ({ current, max }: { current: number; max: number }) => {
      this._bossHealthBar.update(current, max);
      if (current <= 0) this._bossHealthBar.hide();
    });

    emitter.on(GameEvents.COMBO_UPDATED, ({ count, windowActive }: { count: number; windowActive: boolean }) => {
      this._comboCounter.update(count, windowActive);
    });

    emitter.on(GameEvents.SPECIAL_COOLDOWN_CHANGED, ({ fraction }: { fraction: number }) => {
      this._specialCooldown.update(fraction);
    });

    emitter.on(GameEvents.TIMER_TICK, ({ remaining }: { remaining: number }) => {
      this._timerDisplay.update(remaining);
    });

    emitter.on(GameEvents.STAGE_CLEARED, (_data: { score: number; timeBonus: number }) => {
      // StageManager owns the scene transition (fade + restart/gameover).
      // HudScene only needs to hide components that would be stale after clear.
      this._bossHealthBar.hide();
    });

    emitter.on(GameEvents.GAME_OVER, ({ score }: { score: number }) => {
      this._checkLeaderboard(score);
    });

    emitter.on(GameEvents.PAUSE_TOGGLED, ({ paused }: { paused: boolean }) => {
      if (paused) {
        this.scene.pause('GameScene');
        this.scene.launch('PauseOverlayScene');
      } else {
        this.scene.resume('GameScene');
        this.scene.stop('PauseOverlayScene');
      }
    });
  }

  private _checkLeaderboard(score: number): void {
    if (this._leaderboard.qualifiesForTop10(score)) {
      const rawName = window.prompt(
        `🏆 New high score: ${score}!\nEnter your name (max ${HUD_LEADERBOARD_NAME_MAX_LENGTH} chars):`,
        'AAA',
      );
      const name = (rawName ?? 'AAA').slice(0, HUD_LEADERBOARD_NAME_MAX_LENGTH).trim() || 'AAA';
      this._leaderboard.addEntry(name, score);
    }
  }
}
