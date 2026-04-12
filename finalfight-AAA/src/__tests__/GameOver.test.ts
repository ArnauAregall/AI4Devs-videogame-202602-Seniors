/**
 * GameOver.test.ts
 * FR-GOLV-20: Game Over screen supports keyboard cursor navigation (Up/Down/Enter).
 * FR-GOLV-21: Enter activates the currently highlighted option (not always Continue).
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Minimal Phaser mock ────────────────────────────────────────────────────────
const makeKeyboardMock = () => {
    const listeners: Map<string, (() => void)[]> = new Map();
    return {
        on: vi.fn((event: string, handler: () => void) => {
            if (!listeners.has(event)) listeners.set(event, []);
            listeners.get(event)!.push(handler);
        }),
        trigger: (event: string) => {
            (listeners.get(event) ?? []).forEach(h => h());
        },
    };
};

vi.mock('phaser', () => {
    class Text {
        private _color = '#ffffff';
        setOrigin() { return this; }
        setInteractive() { return this; }
        setColor(c: string) { this._color = c; return this; }
        getColor() { return this._color; }
        on() { return this; }
    }
    class Scene {
        scale = { width: 384, height: 224 };
        cameras = { main: { setBackgroundColor: vi.fn() } };
        input: { keyboard: ReturnType<typeof makeKeyboardMock> | null } = { keyboard: makeKeyboardMock() };
        time = { delayedCall: vi.fn((_delay: number, cb: () => void) => cb()) };
        scene = {
            stop: vi.fn(), start: vi.fn(), get: vi.fn().mockReturnValue({ resumeAfterContinue: vi.fn() }),
            launch: vi.fn(),
        };
        private _texts: Text[] = [];
        add = {
            text: vi.fn((_x: number, _y: number, _content: string, _style: unknown) => {
                const t = new Text();
                this._texts.push(t);
                return t;
            }),
        };
        getTexts() { return this._texts; }
    }
    return {
        default: {
            Scene,
            AUTO: 0,
            Scale: { FIT: 'FIT', NONE: 'NONE', CENTER_BOTH: 'CENTER_BOTH' },
        },
        Scene,
    };
});

import { GameOver } from '../game/scenes/GameOver';

/** Helper: fire a keyboard event through the scene's input mock. */
function pressKey(scene: GameOver, event: string) {
    const kb = (scene as unknown as { input: { keyboard: ReturnType<typeof makeKeyboardMock> } }).input.keyboard;
    kb.trigger(event);
}

/** Returns the _cursor private field. */
function getCursor(scene: GameOver): number {
    return (scene as unknown as { _cursor: number })._cursor;
}

/** Returns the _options private field. */
function getOptions(scene: GameOver): { getColor: () => string }[] {
    return (scene as unknown as { _options: { getColor: () => string }[] })._options;
}

// ── Tests ──────────────────────────────────────────────────────────────────────

describe('GameOver — keyboard cursor nav with Continue option (3 options)', () => {
    let scene: GameOver;

    beforeEach(() => {
        scene = new GameOver();
        scene.create({ score: 0, continuesLeft: 2 });
    });

    it('cursor starts at 0 after create()', () => {
        expect(getCursor(scene)).toBe(0);
    });

    it('first option is highlighted (#ffcc00) on create', () => {
        expect(getOptions(scene)[0].getColor()).toBe('#ffcc00');
    });

    it('other options are white (#ffffff) on create', () => {
        const opts = getOptions(scene);
        expect(opts[1].getColor()).toBe('#ffffff');
        expect(opts[2].getColor()).toBe('#ffffff');
    });

    it('Down arrow moves cursor from 0 to 1', () => {
        pressKey(scene, 'keydown-DOWN');
        expect(getCursor(scene)).toBe(1);
    });

    it('Up arrow moves cursor from 1 to 0', () => {
        pressKey(scene, 'keydown-DOWN');
        pressKey(scene, 'keydown-UP');
        expect(getCursor(scene)).toBe(0);
    });

    it('Down arrow wraps from last to first', () => {
        pressKey(scene, 'keydown-DOWN');
        pressKey(scene, 'keydown-DOWN');
        pressKey(scene, 'keydown-DOWN'); // wraps
        expect(getCursor(scene)).toBe(0);
    });

    it('Up arrow wraps from first (0) to last', () => {
        pressKey(scene, 'keydown-UP');
        expect(getCursor(scene)).toBe(2);
    });

    it('Enter on Continue (cursor=0) calls handleContinue', () => {
        const spy = vi.spyOn(scene as unknown as { handleContinue: () => void }, 'handleContinue').mockImplementation(() => {});
        pressKey(scene, 'keydown-ENTER');
        expect(spy).toHaveBeenCalledOnce();
    });

    it('Enter on Quit (cursor=2) calls quitToMenu, not handleContinue', () => {
        pressKey(scene, 'keydown-DOWN');
        pressKey(scene, 'keydown-DOWN');
        const continueSpy = vi.spyOn(scene as unknown as { handleContinue: () => void }, 'handleContinue').mockImplementation(() => {});
        const quitSpy     = vi.spyOn(scene as unknown as { quitToMenu: () => void }, 'quitToMenu').mockImplementation(() => {});
        pressKey(scene, 'keydown-ENTER');
        expect(quitSpy).toHaveBeenCalledOnce();
        expect(continueSpy).not.toHaveBeenCalled();
    });
});

describe('GameOver — keyboard cursor nav without Continue option (2 options)', () => {
    let scene: GameOver;

    beforeEach(() => {
        scene = new GameOver();
        scene.create({ score: 0, continuesLeft: 0 });
    });

    it('has exactly 2 options when no continues remain', () => {
        expect(getOptions(scene)).toHaveLength(2);
    });

    it('cursor starts at 0 (HighScores)', () => {
        expect(getCursor(scene)).toBe(0);
    });

    it('Enter on cursor=0 calls showLeaderboard, not handleContinue', () => {
        const continueSpy  = vi.spyOn(scene as unknown as { handleContinue: () => void }, 'handleContinue').mockImplementation(() => {});
        const leaderSpy    = vi.spyOn(scene as unknown as { showLeaderboard: () => void }, 'showLeaderboard').mockImplementation(() => {});
        pressKey(scene, 'keydown-ENTER');
        expect(leaderSpy).toHaveBeenCalledOnce();
        expect(continueSpy).not.toHaveBeenCalled();
    });

    it('Enter on cursor=1 calls quitToMenu', () => {
        pressKey(scene, 'keydown-DOWN');
        const quitSpy = vi.spyOn(scene as unknown as { quitToMenu: () => void }, 'quitToMenu').mockImplementation(() => {});
        pressKey(scene, 'keydown-ENTER');
        expect(quitSpy).toHaveBeenCalledOnce();
    });
});
