/**
 * StageData.test.ts
 * FR-GOLV-10: First enemy spawn trigger is ≤ 2 screen widths from the start.
 * FR-GOLV-11: At least 2 enemy archetypes present by zone 3.
 * FR-GOLV-12: Each zone has ≥ 2 enemies.
 * FR-GOLV-13: Total enemy count across all zones is ≥ 8.
 */
import { describe, it, expect, vi } from 'vitest';

vi.mock('phaser', () => ({
    default: {
        Scene: class {},
        AUTO: 0,
        Scale: { FIT: 'FIT', NONE: 'NONE', CENTER_BOTH: 'CENTER_BOTH' },
    },
    Scene: class {},
}));

import { stage1Data } from '../data/stage1Data';
import { GameConfig } from '../config/GameConfig';

const CANVAS_WIDTH = GameConfig.CANVAS_WIDTH;

describe('stage1Data — pacing and archetype variety', () => {
    it('first scroll trigger fires within 2 screen widths (≤ 768px)', () => {
        const firstTrigger = stage1Data.scrollTriggers[0].worldX;
        expect(firstTrigger).toBeLessThanOrEqual(CANVAS_WIDTH * 2);
    });

    it('each zone has at least 2 enemies', () => {
        for (const zone of stage1Data.spawnZones) {
            const total = zone.entries.reduce((sum, e) => sum + e.count, 0);
            expect(total).toBeGreaterThanOrEqual(2);
        }
    });

    it('total enemy count across all zones is ≥ 8', () => {
        const total = stage1Data.spawnZones.reduce((sum, zone) =>
            sum + zone.entries.reduce((s, e) => s + e.count, 0), 0);
        expect(total).toBeGreaterThanOrEqual(8);
    });

    it('zone 3 (zone-1c) has at least 2 distinct archetypes', () => {
        const zone3 = stage1Data.spawnZones.find(z => z.id === 'zone-1c');
        expect(zone3).toBeDefined();
        const archetypes = new Set(zone3!.entries.map(e => e.archetype));
        expect(archetypes.size).toBeGreaterThanOrEqual(2);
    });

    it('zone 2 (zone-1b) has at least 2 distinct archetypes', () => {
        const zone2 = stage1Data.spawnZones.find(z => z.id === 'zone-1b');
        expect(zone2).toBeDefined();
        const archetypes = new Set(zone2!.entries.map(e => e.archetype));
        expect(archetypes.size).toBeGreaterThanOrEqual(2);
    });

    it('scroll triggers are in ascending worldX order', () => {
        const xs = stage1Data.scrollTriggers.map(t => t.worldX);
        for (let i = 1; i < xs.length; i++) {
            expect(xs[i]).toBeGreaterThan(xs[i - 1]);
        }
    });
});
