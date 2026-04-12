import { vi, describe, it, expect, beforeEach } from 'vitest';

vi.mock('phaser', () => {
    class Scene {
        sound = { pauseAll: vi.fn(), resumeAll: vi.fn() };
        input = { keyboard: { on: vi.fn() } };
        scene = {
            pause: vi.fn(), resume: vi.fn(),
            launch: vi.fn(), get: vi.fn(), stop: vi.fn(),
        };
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

import { GameScene } from '../game/scenes/GameScene';
import { GameConfig } from '../config/GameConfig';

const FIXED = GameConfig.FIXED_DELTA_MS;
const MAX = GameConfig.MAX_STEPS_PER_FRAME;

describe('GameScene — fixed-timestep accumulator', () => {
    let scene: GameScene;
    let stepCount: number;
    let callback: (dt: number) => void;

    beforeEach(() => {
        scene = new GameScene();
        stepCount = 0;
        callback = (_dt: number) => { stepCount++; };
        scene.registerFixedUpdate(callback);
    });

    it('runs exactly 1 step when delta equals FIXED_DELTA_MS', () => {
        scene.update(0, FIXED);
        expect(stepCount).toBe(1);
    });

    it('runs exactly 2 steps when delta equals 2 × FIXED_DELTA_MS', () => {
        scene.update(0, FIXED * 2);
        expect(stepCount).toBe(2);
    });

    it('caps steps at MAX_STEPS_PER_FRAME when delta is very large', () => {
        scene.update(0, FIXED * (MAX + 10));
        expect(stepCount).toBe(MAX);
    });

    it('discards surplus so next update with zero delta runs no steps', () => {
        scene.update(0, FIXED * (MAX + 10)); // triggers cap + discard
        stepCount = 0;
        scene.update(0, 0);
        expect(stepCount).toBe(0);
    });

    it('calls callback with FIXED_DELTA_MS as argument', () => {
        const receivedDeltas: number[] = [];
        scene.unregisterFixedUpdate(callback);
        scene.registerFixedUpdate((dt) => receivedDeltas.push(dt));
        scene.update(0, FIXED);
        expect(receivedDeltas).toEqual([FIXED]);
    });
});

describe('GameScene — register / unregister', () => {
    let scene: GameScene;

    beforeEach(() => {
        scene = new GameScene();
    });

    it('registered callback is called each fixed step', () => {
        let called = false;
        const fn = () => { called = true; };
        scene.registerFixedUpdate(fn);
        scene.update(0, FIXED);
        expect(called).toBe(true);
    });

    it('unregistered callback is NOT called after removal', () => {
        let called = false;
        const fn = () => { called = true; };
        scene.registerFixedUpdate(fn);
        scene.unregisterFixedUpdate(fn);
        scene.update(0, FIXED);
        expect(called).toBe(false);
    });

    it('multiple callbacks are all invoked each step', () => {
        const counts = [0, 0, 0];
        scene.registerFixedUpdate(() => { counts[0]++; });
        scene.registerFixedUpdate(() => { counts[1]++; });
        scene.registerFixedUpdate(() => { counts[2]++; });
        scene.update(0, FIXED);
        expect(counts).toEqual([1, 1, 1]);
    });
});
