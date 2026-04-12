import { describe, it, expect, beforeEach } from 'vitest';
import { HurtboxComponent } from '../combat/HurtboxComponent';

describe('HurtboxComponent', () => {
  let hb: HurtboxComponent;

  beforeEach(() => {
    hb = new HurtboxComponent('test', { x: 0, y: 0, w: 24, h: 48 }, 'enemy');
  });

  it('initialises with correct id, rect, and teamTag', () => {
    expect(hb.id).toBe('test');
    expect(hb.teamTag).toBe('enemy');
    expect(hb.rect).toEqual({ x: 0, y: 0, w: 24, h: 48 });
    expect(hb.invincible).toBe(false);
  });

  it('update() repositions rect to given centre', () => {
    hb.update(100, 150);
    expect(hb.rect.x).toBe(100 - 12); // centre - half-width
    expect(hb.rect.y).toBe(150 - 24); // centre - half-height
    expect(hb.rect.w).toBe(24);
    expect(hb.rect.h).toBe(48);
  });

  it('invincible flag defaults to false', () => {
    expect(hb.invincible).toBe(false);
  });

  it('invincible flag can be set and cleared', () => {
    hb.invincible = true;
    expect(hb.invincible).toBe(true);
    hb.invincible = false;
    expect(hb.invincible).toBe(false);
  });

  it('preserves width and height after update', () => {
    hb.update(200, 300);
    expect(hb.rect.w).toBe(24);
    expect(hb.rect.h).toBe(48);
  });
});
