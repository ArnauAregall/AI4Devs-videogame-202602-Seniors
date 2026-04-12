// ============================================================
// ParallaxBackground.ts — Tiling parallax background layers.
// @spec FR-PB-01 Minimum three parallax layers
// @spec FR-PB-02 Seamless tiling
// @spec FR-PB-03 Update via fixed-timestep callback
// ============================================================
import Phaser from 'phaser';
import type { ParallaxLayerDef } from './StageData';

interface LayerEntry {
  tileSprite: Phaser.GameObjects.TileSprite;
  speedFactor: number;
}

export class ParallaxBackground {
  private readonly _layers: LayerEntry[] = [];
  private readonly _fixedUpdateBound: (dt: number) => void;
  private _cameraDeltaX: number = 0;

  constructor(
    private readonly scene: Phaser.Scene,
    layerDefs: ParallaxLayerDef[],
  ) {
    const { width, height } = scene.scale;

    // Create layers rearmost-first so depth ordering matches layerDefs index
    for (const def of layerDefs) {
      const ts = scene.add.tileSprite(0, 0, width, height, def.textureKey);
      ts.setOrigin(0, 0);
      ts.setDepth(def.depth);
      this._layers.push({ tileSprite: ts, speedFactor: def.speedFactor });
    }

    this._fixedUpdateBound = this._fixedUpdate.bind(this);
    scene.registerFixedUpdate(this._fixedUpdateBound);
  }

  /**
   * Must be called each time the camera moves.
   * Typically called by StageManager before the fixed-update tick.
   */
  setCameraDelta(dx: number): void {
    this._cameraDeltaX = dx;
  }

  private _fixedUpdate(_dt: number): void {
    for (const layer of this._layers) {
      layer.tileSprite.tilePositionX += this._cameraDeltaX * layer.speedFactor;
    }
  }

  destroy(): void {
    this.scene.unregisterFixedUpdate(this._fixedUpdateBound);
    for (const layer of this._layers) {
      layer.tileSprite.destroy();
    }
    this._layers.length = 0;
  }

  /** Number of active layers — exposed for testing. */
  get layerCount(): number {
    return this._layers.length;
  }

  /** Speed factor of layer at index — exposed for testing. */
  getSpeedFactor(index: number): number {
    return this._layers[index]?.speedFactor ?? 0;
  }
}
