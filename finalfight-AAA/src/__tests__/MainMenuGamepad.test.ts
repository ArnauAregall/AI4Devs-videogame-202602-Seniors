/**
 * MainMenuGamepad.test.ts
 * Tests for gamepad navigation in MainMenuScene.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Minimal Phaser mock ────────────────────────────────────────────────────────
const makePadMock = () => ({ up: false, down: false, A: false });

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

let padMock = makePadMock();

vi.mock('phaser', () => {
    class Text {
        setOrigin() { return this; }
        setInteractive() { return this; }
        setColor() { return this; }
        on() { return this; }
    }
    class Scene {
        scale = { width: 384, height: 224 };
        input: {
            keyboard: ReturnType<typeof makeKeyboardMock> | null;
            gamepad: { getPad: (index: number) => typeof padMock | null } | null;
        } = { keyboard: makeKeyboardMock(), gamepad: { getPad: () => padMock } };
        time = { delayedCall: vi.fn((_delay: number, cb: () => void) => cb()) };
        scene = { start: vi.fn() };
        add = {
            text: vi.fn(() => {
                const t = new Text();
                return t;
            }),
        };
    }
    return {
        default: { Scene, AUTO: 0, Scale: { FIT: 'FIT', NONE: 'NONE', CENTER_BOTH: 'CENTER_BOTH' } },
        Scene,
        GameObjects: { Text },
    };
});

import { MainMenu } from '../game/scenes/MainMenu';

function getCursor(scene: MainMenu): number {
    return (scene as unknown as { _cursor: number })._cursor;
}

describe('MainMenu — gamepad navigation', () => {
    let scene: MainMenu;

    beforeEach(() => {
        padMock = makePadMock();
        scene = new MainMenu();
        scene.create();
    });

    it('D-pad down calls _move(1) after cooldown expires', () => {
        const spy = vi.spyOn(scene as unknown as { _move: (d: number) => void }, '_move');
        padMock.down = true;
        scene.update();
        expect(spy).toHaveBeenCalledWith(1);
        expect(getCursor(scene)).toBe(1);
    });

    it('gamepad button A calls _activate()', () => {
        const spy = vi.spyOn(scene as unknown as { _activate: () => void }, '_activate');
        padMock.A = true;
        scene.update();
        expect(spy).toHaveBeenCalledOnce();
    });

    it('debounce prevents input within cooldown window', () => {
        const spy = vi.spyOn(scene as unknown as { _move: (d: number) => void }, '_move');
        padMock.down = true;

        scene.update(); // accepted — cooldown set to 12
        expect(spy).toHaveBeenCalledTimes(1);

        // Simulate frames within cooldown (12 frames decrement cooldown to 0)
        for (let i = 0; i < 12; i++) {
            scene.update();
        }
        expect(spy).toHaveBeenCalledTimes(1); // still blocked (cooldown decrements)

        // Next frame — cooldown is 0, input accepted again
        scene.update();
        expect(spy).toHaveBeenCalledTimes(2);
    });
});
