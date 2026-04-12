import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('phaser', () => ({
  default: { Scene: class {} },
  Scene:   class {},
}));

function makeTextMock() {
  const t = {
    _text:    '',
    _visible: false,
    setText:     vi.fn((v: string)    => { t._text    = v;    return t; }),
    setVisible:  vi.fn((v: boolean)   => { t._visible = v;    return t; }),
    setDepth:    vi.fn().mockReturnThis(),
    get text()    { return t._text; },
    get visible() { return t._visible; },
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

import { ComboCounter } from '../hud/ComboCounter';
import { HUD_COMBO_MIN_COUNT } from '../hud/HudConfig';

describe('ComboCounter', () => {
  let scene: ReturnType<typeof makeScene>;

  beforeEach(() => {
    vi.clearAllMocks();
    scene = makeScene();
  });

  it('starts hidden', () => {
    const counter = new ComboCounter(scene as never);
    expect(counter.visible).toBe(false);
  });

  it(`is hidden when count is below ${HUD_COMBO_MIN_COUNT}`, () => {
    const counter = new ComboCounter(scene as never);
    counter.update(HUD_COMBO_MIN_COUNT - 1, true);
    expect(counter.visible).toBe(false);
  });

  it(`is visible when count is exactly ${HUD_COMBO_MIN_COUNT} and window active`, () => {
    const counter = new ComboCounter(scene as never);
    counter.update(HUD_COMBO_MIN_COUNT, true);
    expect(counter.visible).toBe(true);
  });

  it('shows "N HIT" text when visible', () => {
    const counter = new ComboCounter(scene as never);
    counter.update(5, true);
    expect(scene._textMock.text).toBe('5 HIT');
  });

  it('is hidden when windowActive is false', () => {
    const counter = new ComboCounter(scene as never);
    counter.update(5, true);
    counter.update(0, false);
    expect(counter.visible).toBe(false);
  });

  it('exposes current count via getter', () => {
    const counter = new ComboCounter(scene as never);
    counter.update(7, true);
    expect(counter.count).toBe(7);
  });
});
