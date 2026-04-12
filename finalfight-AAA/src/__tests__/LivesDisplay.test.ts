import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('phaser', () => ({
  default: { Scene: class {} },
  Scene:   class {},
}));

function makeTextMock() {
  const t = {
    _text: '',
    setText:  vi.fn((v: string) => { t._text = v; return t; }),
    setDepth: vi.fn().mockReturnThis(),
    get text() { return t._text; },
  };
  return t;
}

function makeScene() {
  const textMock = makeTextMock();
  return {
    add: {
      text: vi.fn((_x: number, _y: number, initialText: string) => {
        textMock._text = initialText;
        return textMock;
      }),
    },
    _textMock: textMock,
  };
}

import { LivesDisplay } from '../hud/LivesDisplay';

describe('LivesDisplay', () => {
  let scene: ReturnType<typeof makeScene>;

  beforeEach(() => {
    vi.clearAllMocks();
    scene = makeScene();
  });

  it('initialises with provided lives count', () => {
    const display = new LivesDisplay(scene as never, 3);
    expect(display.lives).toBe(3);
  });

  it('shows "P1 x N" label format', () => {
    const display = new LivesDisplay(scene as never, 3);
    expect(display.text).toBe('P1 x 3');
  });

  it('update() changes lives and label', () => {
    const display = new LivesDisplay(scene as never, 3);
    display.update(2);
    expect(display.lives).toBe(2);
    expect(display.text).toBe('P1 x 2');
  });

  it('update() to 0 shows "P1 x 0"', () => {
    const display = new LivesDisplay(scene as never, 1);
    display.update(0);
    expect(display.lives).toBe(0);
    expect(display.text).toBe('P1 x 0');
  });
});
