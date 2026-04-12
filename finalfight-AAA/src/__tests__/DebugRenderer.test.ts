import { describe, it, expect, vi, beforeEach } from 'vitest';

const mocks = vi.hoisted(() => {
  const graphicsMock = {
    clear:       vi.fn().mockReturnThis(),
    lineStyle:   vi.fn().mockReturnThis(),
    strokeRect:  vi.fn().mockReturnThis(),
    setDepth:    vi.fn().mockReturnThis(),
    setVisible:  vi.fn().mockReturnThis(),
    destroy:     vi.fn(),
    visible:     true,
  };
  const sceneMock = {
    add: {
      graphics: vi.fn().mockReturnValue(graphicsMock),
    },
  };
  return { sceneMock, graphicsMock };
});

vi.mock('phaser', () => ({
  default: {
    Scene: class {},
    AUTO: 0,
    Scale: { FIT: 'FIT', NONE: 'NONE', CENTER_BOTH: 'CENTER_BOTH' },
  },
  Scene: class {},
}));

import type Phaser from 'phaser';
import { CombatSystem } from '../combat/CombatSystem';
import { DebugRenderer } from '../combat/DebugRenderer';

// Force DEBUG_HITBOXES to true for tests
vi.mock('../config/GameConfig', () => ({
  GameConfig: {
    DEBUG_HITBOXES: true,
    CANVAS_WIDTH: 384,
    CANVAS_HEIGHT: 224,
  },
}));

describe('DebugRenderer', () => {
  let combat: CombatSystem;
  let renderer: DebugRenderer;

  beforeEach(() => {
    vi.clearAllMocks();
    combat   = new CombatSystem();
    renderer = new DebugRenderer(mocks.sceneMock as unknown as Phaser.Scene, combat);
  });

  it('creates a graphics object on construction', () => {
    expect(mocks.sceneMock.add.graphics).toHaveBeenCalled();
  });

  it('update() calls clear when visible', () => {
    renderer.update();
    expect(mocks.graphicsMock.clear).toHaveBeenCalled();
  });

  it('update() draws hitboxes in red', () => {
    combat.registerHitbox('hx1', { x: 10, y: 10, w: 30, h: 20 }, 'player', 8, 40, 0, 10, 'right');
    renderer.update();
    // lineStyle should have been called with red (0xff0000)
    expect(mocks.graphicsMock.lineStyle).toHaveBeenCalledWith(1, 0xff0000, 1);
    expect(mocks.graphicsMock.strokeRect).toHaveBeenCalledWith(10, 10, 30, 20);
  });

  it('update() draws hurtboxes in green', () => {
    combat.registerHurtbox('e1', { x: 50, y: 50, w: 24, h: 48 }, 'enemy');
    renderer.update();
    expect(mocks.graphicsMock.lineStyle).toHaveBeenCalledWith(1, 0x00ff00, 1);
    expect(mocks.graphicsMock.strokeRect).toHaveBeenCalledWith(50, 50, 24, 48);
  });

  it('setVisible(false) hides the graphics object', () => {
    renderer.setVisible(false);
    expect(mocks.graphicsMock.setVisible).toHaveBeenCalledWith(false);
  });

  it('setVisible(false) clears the graphics overlay', () => {
    renderer.setVisible(false);
    expect(mocks.graphicsMock.clear).toHaveBeenCalled();
  });

  it('setVisible(true) shows the graphics object', () => {
    renderer.setVisible(false);
    vi.clearAllMocks();
    renderer.setVisible(true);
    expect(mocks.graphicsMock.setVisible).toHaveBeenCalledWith(true);
  });

  it('update() does nothing when hidden', () => {
    renderer.setVisible(false);
    vi.clearAllMocks();
    renderer.update();
    expect(mocks.graphicsMock.clear).not.toHaveBeenCalled();
  });

  it('destroy() destroys the underlying graphics object', () => {
    renderer.destroy();
    expect(mocks.graphicsMock.destroy).toHaveBeenCalled();
  });
});
