import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('phaser', () => ({
  default: { Scene: class {} },
  Scene:   class {},
}));

function makeTextMock() {
  const t = {
    _text:  '',
    _color: '#ffffff',
    setText:   vi.fn((v: string) => { t._text  = v;    return t; }),
    setColor:  vi.fn((v: string) => { t._color = v;    return t; }),
    setOrigin: vi.fn().mockReturnThis(),
    setDepth:  vi.fn().mockReturnThis(),
    get text()  { return t._text; },
    get color() { return t._color; },
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

import { TimerDisplay } from '../hud/TimerDisplay';
import { HUD_TIMER_WARNING_SECONDS, HUD_TIMER_START_SECONDS } from '../hud/HudConfig';

const NORMAL_COLOUR  = '#ffffff';
// Compute expected warning colour from constant
const WARNING_HEX    = `#${(0xff2222).toString(16).padStart(6, '0')}`;

describe('TimerDisplay', () => {
  let scene: ReturnType<typeof makeScene>;

  beforeEach(() => {
    vi.clearAllMocks();
    scene = makeScene();
  });

  it(`initialises at ${HUD_TIMER_START_SECONDS} seconds`, () => {
    const display = new TimerDisplay(scene as never);
    expect(display.remaining).toBe(HUD_TIMER_START_SECONDS);
    expect(scene._textMock.text).toBe(String(HUD_TIMER_START_SECONDS));
  });

  it('uses normal (white) colour above warning threshold', () => {
    const display = new TimerDisplay(scene as never);
    display.update(HUD_TIMER_WARNING_SECONDS + 1);
    expect(display.colour).toBe(NORMAL_COLOUR);
  });

  it(`switches to warning colour at ${HUD_TIMER_WARNING_SECONDS} seconds`, () => {
    const display = new TimerDisplay(scene as never);
    display.update(HUD_TIMER_WARNING_SECONDS);
    expect(display.colour).toBe(WARNING_HEX);
  });

  it('is warning colour below threshold', () => {
    const display = new TimerDisplay(scene as never);
    display.update(10);
    expect(display.colour).toBe(WARNING_HEX);
  });

  it('updates displayed text', () => {
    const display = new TimerDisplay(scene as never);
    display.update(99);
    expect(display.remaining).toBe(99);
    expect(scene._textMock.text).toBe('99');
  });

  it('colour at 0 is warning', () => {
    const display = new TimerDisplay(scene as never);
    display.update(0);
    expect(display.colour).toBe(WARNING_HEX);
  });
});
