import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('phaser', () => ({
  default: { Scene: class {} },
  Scene:   class {},
}));

function makeTextMock() {
  const t = {
    _text: '0',
    _origin: { x: 0, y: 0 },
    setText:   vi.fn((v: string) => { t._text = v; return t; }),
    setOrigin: vi.fn((x: number, y: number) => { t._origin = { x, y }; return t; }),
    setDepth:  vi.fn().mockReturnThis(),
    get text() { return t._text; },
  };
  return t;
}

function makeScene() {
  const textMock = makeTextMock();
  return {
    add: { text: vi.fn(() => textMock) },
    _textMock: textMock,
  };
}

import { ScoreDisplay } from '../hud/ScoreDisplay';

describe('ScoreDisplay', () => {
  let scene: ReturnType<typeof makeScene>;

  beforeEach(() => {
    vi.clearAllMocks();
    scene = makeScene();
  });

  it('initialises with score 0', () => {
    const display = new ScoreDisplay(scene as never);
    expect(display.score).toBe(0);
    expect(display.text).toBe('0');
  });

  it('update() changes displayed score', () => {
    const display = new ScoreDisplay(scene as never);
    display.update(1500);
    expect(display.score).toBe(1500);
    expect(display.text).toBe('1500');
  });

  it('uses right-align origin (1, 0)', () => {
    new ScoreDisplay(scene as never);
    expect(scene._textMock._origin.x).toBe(1);
    expect(scene._textMock._origin.y).toBe(0);
  });

  it('accumulates multiple updates correctly', () => {
    const display = new ScoreDisplay(scene as never);
    display.update(100);
    display.update(350);
    expect(display.score).toBe(350);
    expect(display.text).toBe('350');
  });
});
