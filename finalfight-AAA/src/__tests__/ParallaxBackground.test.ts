import { describe, it, expect, vi, beforeEach } from 'vitest';

const mocks = vi.hoisted(() => {
  const tileSpriteInstances: Array<{
    tilePositionX: number;
    depth: number;
    setOrigin: ReturnType<typeof vi.fn>;
    setDepth: ReturnType<typeof vi.fn>;
    setScrollFactor: ReturnType<typeof vi.fn>;
    destroy: ReturnType<typeof vi.fn>;
  }> = [];

  const sceneMock = {
    registerFixedUpdate:   vi.fn(),
    unregisterFixedUpdate: vi.fn(),
    scale: { width: 384, height: 224 },
    add: {
      tileSprite: vi.fn((_x: number, _y: number, _w: number, _h: number, _key: string) => {
        const ts = {
          tilePositionX: 0,
          depth: 0,
          setOrigin: vi.fn(),
          setDepth: vi.fn((d: number) => { ts.depth = d; }),
          setScrollFactor: vi.fn(),
          destroy: vi.fn(),
        };
        tileSpriteInstances.push(ts);
        return ts;
      }),
    },
  };

  return { sceneMock, tileSpriteInstances };
});

vi.mock('phaser', () => ({
  default: {
    Scene: class {},
    AUTO: 0,
    Scale: { FIT: 'FIT', NONE: 'NONE', CENTER_BOTH: 'CENTER_BOTH' },
  },
  Scene: class {},
}));

import { ParallaxBackground } from '../stage/ParallaxBackground';
import type { ParallaxLayerDef } from '../stage/StageData';

const LAYERS: ParallaxLayerDef[] = [
  { textureKey: 'layer-1', speedFactor: 0.1, depth: 0 },
  { textureKey: 'layer-2', speedFactor: 0.3, depth: 1 },
  { textureKey: 'layer-3', speedFactor: 0.6, depth: 2 },
];

describe('ParallaxBackground', () => {
  let bg: ParallaxBackground;
  let registeredCallback: (dt: number) => void;

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.tileSpriteInstances.length = 0;
    mocks.sceneMock.registerFixedUpdate.mockImplementation((fn: (dt: number) => void) => {
      registeredCallback = fn;
    });
    mocks.sceneMock.add.tileSprite.mockImplementation(
      (_x: number, _y: number, _w: number, _h: number, _key: string) => {
        const ts = {
          tilePositionX: 0,
          depth: 0,
          setOrigin: vi.fn(),
          setDepth: vi.fn((d: number) => { ts.depth = d; }),
          setScrollFactor: vi.fn(),
          destroy: vi.fn(),
        };
        mocks.tileSpriteInstances.push(ts);
        return ts;
      },
    );
    bg = new ParallaxBackground(
      mocks.sceneMock as unknown as Parameters<typeof ParallaxBackground>[0],
      LAYERS,
    );
  });

  it('creates one TileSprite per layer def', () => {
    expect(bg.layerCount).toBe(LAYERS.length);
    expect(mocks.sceneMock.add.tileSprite).toHaveBeenCalledTimes(LAYERS.length);
  });

  it('rearmost layer has smallest speedFactor', () => {
    expect(bg.getSpeedFactor(0)).toBeLessThan(bg.getSpeedFactor(1));
    expect(bg.getSpeedFactor(1)).toBeLessThan(bg.getSpeedFactor(2));
  });

  it('updates tilePositionX proportional to camera delta and speedFactor', () => {
    const delta = 10;
    bg.setCameraDelta(delta);
    registeredCallback(16);

    const ts0 = mocks.tileSpriteInstances[0];
    const ts1 = mocks.tileSpriteInstances[1];
    const ts2 = mocks.tileSpriteInstances[2];

    expect(ts0.tilePositionX).toBeCloseTo(delta * LAYERS[0].speedFactor);
    expect(ts1.tilePositionX).toBeCloseTo(delta * LAYERS[1].speedFactor);
    expect(ts2.tilePositionX).toBeCloseTo(delta * LAYERS[2].speedFactor);
  });

  it('accumulates tilePositionX over multiple ticks', () => {
    bg.setCameraDelta(5);
    registeredCallback(16);
    registeredCallback(16);
    expect(mocks.tileSpriteInstances[0].tilePositionX).toBeCloseTo(5 * LAYERS[0].speedFactor * 2);
  });

  it('registers fixedUpdate on construction', () => {
    expect(mocks.sceneMock.registerFixedUpdate).toHaveBeenCalledOnce();
  });

  it('unregisters callback and destroys sprites on destroy()', () => {
    bg.destroy();
    expect(mocks.sceneMock.unregisterFixedUpdate).toHaveBeenCalledOnce();
    expect(bg.layerCount).toBe(0);
  });
});
