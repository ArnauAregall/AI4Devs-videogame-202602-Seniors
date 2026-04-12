import { describe, it, expect, beforeEach } from 'vitest';
import { PlayerState } from '../player/PlayerState';
import { PlayerStateMachine } from '../player/PlayerStateMachine';

describe('PlayerStateMachine', () => {
  let fsm: PlayerStateMachine;

  beforeEach(() => {
    fsm = new PlayerStateMachine();
  });

  // ── Enum ────────────────────────────────────────────────────────────────
  it('defines exactly 11 unique state values', () => {
    const values = Object.values(PlayerState);
    expect(values).toHaveLength(11);
    expect(new Set(values).size).toBe(11);
  });

  // ── Legal transitions ────────────────────────────────────────────────────
  it('transitions from Idle to Walk (legal)', () => {
    expect(fsm.transition(PlayerState.Walk)).toBe(true);
    expect(fsm.current).toBe(PlayerState.Walk);
  });

  it('runs onExit and onEnter hooks on a legal transition', () => {
    const log: string[] = [];
    fsm.onExit  = (s) => log.push(`exit:${s}`);
    fsm.onEnter = (s) => log.push(`enter:${s}`);

    fsm.transition(PlayerState.Walk);

    expect(log).toEqual(['exit:Idle', 'enter:Walk']);
    expect(fsm.current).toBe(PlayerState.Walk);
  });

  // ── Illegal transitions ──────────────────────────────────────────────────
  it('silently ignores illegal transitions (Knockdown → Walk)', () => {
    fsm.current = PlayerState.Knockdown;
    const result = fsm.transition(PlayerState.Walk);
    expect(result).toBe(false);
    expect(fsm.current).toBe(PlayerState.Knockdown);
  });

  it('does not run hooks on an illegal transition', () => {
    let called = false;
    fsm.current = PlayerState.Knockdown;
    fsm.onExit  = () => { called = true; };
    fsm.onEnter = () => { called = true; };

    fsm.transition(PlayerState.Walk);

    expect(called).toBe(false);
  });

  // ── Hurt interrupt rule ──────────────────────────────────────────────────
  it('interrupts LightAttack with Hurt', () => {
    fsm.current = PlayerState.LightAttack;
    expect(fsm.transition(PlayerState.Hurt)).toBe(true);
    expect(fsm.current).toBe(PlayerState.Hurt);
  });

  it('interrupts Walk with Knockdown', () => {
    fsm.current = PlayerState.Walk;
    expect(fsm.transition(PlayerState.Knockdown)).toBe(true);
    expect(fsm.current).toBe(PlayerState.Knockdown);
  });

  it('interrupts SpecialAttack with Hurt', () => {
    fsm.current = PlayerState.SpecialAttack;
    expect(fsm.transition(PlayerState.Hurt)).toBe(true);
    expect(fsm.current).toBe(PlayerState.Hurt);
  });

  // ── SpecialAttack cannot interrupt Knockdown or GetUp ───────────────────
  it('SpecialAttack is blocked from Knockdown', () => {
    fsm.current = PlayerState.Knockdown;
    expect(fsm.transition(PlayerState.SpecialAttack)).toBe(false);
    expect(fsm.current).toBe(PlayerState.Knockdown);
  });

  it('SpecialAttack is blocked from GetUp', () => {
    fsm.current = PlayerState.GetUp;
    expect(fsm.transition(PlayerState.SpecialAttack)).toBe(false);
    expect(fsm.current).toBe(PlayerState.GetUp);
  });

  // ── canTransition (non-mutating) ─────────────────────────────────────────
  it('canTransition returns true for Idle → Jump without mutating state', () => {
    expect(fsm.canTransition(PlayerState.Idle, PlayerState.Jump)).toBe(true);
    expect(fsm.current).toBe(PlayerState.Idle);
  });

  it('canTransition returns false for Knockdown → Walk', () => {
    expect(fsm.canTransition(PlayerState.Knockdown, PlayerState.Walk)).toBe(false);
  });

  // ── Knockdown → GetUp (auto-transition path) ─────────────────────────────
  it('Knockdown can transition to GetUp', () => {
    fsm.current = PlayerState.Knockdown;
    expect(fsm.transition(PlayerState.GetUp)).toBe(true);
    expect(fsm.current).toBe(PlayerState.GetUp);
  });

  it('GetUp transitions to Idle', () => {
    fsm.current = PlayerState.GetUp;
    expect(fsm.transition(PlayerState.Idle)).toBe(true);
    expect(fsm.current).toBe(PlayerState.Idle);
  });
});
