import { vi, describe, it, expect } from 'vitest';

vi.mock('phaser', () => ({
    default: {
        AUTO: 0,
        Scale: { FIT: 'FIT', NONE: 'NONE', CENTER_BOTH: 'CENTER_BOTH' },
    },
    Scene: class {},
}));

import { GameConfig } from '../config/GameConfig';

describe('GameConfig', () => {
    it('CANVAS_WIDTH is a positive integer', () => {
        expect(GameConfig.CANVAS_WIDTH).toBeGreaterThan(0);
        expect(Number.isInteger(GameConfig.CANVAS_WIDTH)).toBe(true);
    });

    it('CANVAS_HEIGHT is a positive integer', () => {
        expect(GameConfig.CANVAS_HEIGHT).toBeGreaterThan(0);
        expect(Number.isInteger(GameConfig.CANVAS_HEIGHT)).toBe(true);
    });

    it('TARGET_FPS equals 60', () => {
        expect(GameConfig.TARGET_FPS).toBe(60);
    });

    it('FIXED_DELTA_MS equals 1000 / TARGET_FPS', () => {
        expect(GameConfig.FIXED_DELTA_MS).toBeCloseTo(1000 / GameConfig.TARGET_FPS);
    });

    it('MAX_STEPS_PER_FRAME is a positive integer greater than zero', () => {
        expect(GameConfig.MAX_STEPS_PER_FRAME).toBeGreaterThan(0);
        expect(Number.isInteger(GameConfig.MAX_STEPS_PER_FRAME)).toBe(true);
    });

    it('STAGE_COUNT equals 3', () => {
        expect(GameConfig.STAGE_COUNT).toBe(3);
    });
});
