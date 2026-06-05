/**
 * MainMenuGamepad.test.ts
 * Tests for gamepad navigation in the MainMenu scene.
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

const makePadMock = (overrides: Partial<{ up: boolean; down: boolean; A: boolean; axes: { getValue: () => number }[] }> = {}) => ({
    up: false,
    down: false,
    A: false,
    axes: [{ getValue: () => 0 }, { getValue: () => 0 }],
    ...overrides,
});

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
        input: {
            keyboard: ReturnType<typeof makeKeyboardMock> | null;
            gamepad: { pad1: ReturnType<typeof makePadMock> | null } | null;
        } = { keyboard: makeKeyboardMock(), gamepad: { pad1: null } };
        time = {
            now: 0,
            delayedCall: vi.fn((_delay: number, cb: () => void) => cb()),
        };
        scene = { start: vi.fn() };
        add = {
            text: vi.fn(() => new Text()),
        };
    }
    return {
        default: { Scene, AUTO: 0, Scale: { FIT: 'FIT', NONE: 'NONE', CENTER_BOTH: 'CENTER_BOTH' } },
        Scene,
        GameObjects: { Text },
    };
});

vi.mock('../../config/GameConfig', () => ({
    GameConfig: { CANVAS_WIDTH: 384 },
}));

import { MainMenu } from '../game/scenes/MainMenu';

type SceneAny = MainMenu & {
    _cursor: number;
    _lastGamepadNav: number;
    _lastGamepadConfirm: number;
    input: { gamepad: { pad1: ReturnType<typeof makePadMock> | null } | null; keyboard: ReturnType<typeof makeKeyboardMock> | null };
    time: { now: number; delayedCall: unknown };
    scene: { start: ReturnType<typeof vi.fn> };
};

function getCursor(scene: MainMenu): number {
    return (scene as unknown as SceneAny)._cursor;
}

function setTime(scene: MainMenu, ms: number): void {
    (scene as unknown as SceneAny).time.now = ms;
}

function setPad(scene: MainMenu, pad: ReturnType<typeof makePadMock> | null): void {
    (scene as unknown as SceneAny).input.gamepad = { pad1: pad };
}

// ── Tests ──────────────────────────────────────────────────────────────────────

describe('MainMenu — gamepad navigation', () => {
    let scene: MainMenu;

    beforeEach(() => {
        scene = new MainMenu();
        (scene as unknown as SceneAny).create();
    });

    it('gamepad d-pad down moves cursor to next option', () => {
        const pad = makePadMock({ down: true });
        setPad(scene, pad);
        setTime(scene, 300);
        (scene as unknown as SceneAny).update(0, 0);
        expect(getCursor(scene)).toBe(1);
    });

    it('gamepad left stick up moves cursor to previous option', () => {
        // Move cursor to 1 first via keyboard
        (scene as unknown as SceneAny).input.keyboard!.trigger('keydown-DOWN');
        expect(getCursor(scene)).toBe(1);

        // Now use stick up to go back
        const pad = makePadMock({ axes: [{ getValue: () => 0 }, { getValue: () => -0.8 }] });
        setPad(scene, pad);
        setTime(scene, 300);
        (scene as unknown as SceneAny).update(0, 0);
        expect(getCursor(scene)).toBe(0);
    });

    it('held d-pad does not move cursor faster than debounce interval', () => {
        const pad = makePadMock({ down: true });
        setPad(scene, pad);

        setTime(scene, 300);
        (scene as unknown as SceneAny).update(0, 0);
        expect(getCursor(scene)).toBe(1);

        // Call again at 400ms (only 100ms later — within debounce)
        setTime(scene, 400);
        (scene as unknown as SceneAny).update(0, 0);
        // Should still be 1 (wrapped would be 0 if it moved again)
        expect(getCursor(scene)).toBe(1);
    });

    it('gamepad A button activates the focused option', () => {
        const pad = makePadMock({ A: true });
        setPad(scene, pad);
        setTime(scene, 300);
        (scene as unknown as SceneAny).update(0, 0);
        expect((scene as unknown as SceneAny).scene.start).toHaveBeenCalledWith('GameScene');
    });

    it('no errors when gamepad is not connected', () => {
        setPad(scene, null);
        setTime(scene, 300);
        expect(() => (scene as unknown as SceneAny).update(0, 0)).not.toThrow();
    });
});
