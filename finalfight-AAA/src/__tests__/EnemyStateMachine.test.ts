import { describe, it, expect, beforeEach } from 'vitest';
import { EnemyStateMachine } from '../enemy/EnemyStateMachine';
import { EnemyState }        from '../enemy/EnemyState';

describe('EnemyStateMachine', () => {
  let enterLog: EnemyState[];
  let exitLog:  EnemyState[];
  let fsm: EnemyStateMachine;

  beforeEach(() => {
    enterLog = [];
    exitLog  = [];
    fsm = new EnemyStateMachine(
      EnemyState.Idle,
      s => enterLog.push(s),
      s => exitLog.push(s),
    );
  });

  it('starts in the Idle state and fires onEnter', () => {
    expect(fsm.state).toBe(EnemyState.Idle);
    expect(enterLog).toContain(EnemyState.Idle);
  });

  it('transitions from Idle to Aggro successfully', () => {
    expect(fsm.transition(EnemyState.Aggro)).toBe(true);
    expect(fsm.state).toBe(EnemyState.Aggro);
  });

  it('fires onExit and onEnter during a valid transition', () => {
    fsm.transition(EnemyState.Aggro);
    expect(exitLog).toContain(EnemyState.Idle);
    expect(enterLog).toContain(EnemyState.Aggro);
  });

  it('rejects an illegal transition and returns false', () => {
    expect(fsm.transition(EnemyState.Death)).toBe(false);
    expect(fsm.state).toBe(EnemyState.Idle);
  });

  it('does not fire hooks on a rejected transition', () => {
    const prevEnter = [...enterLog];
    fsm.transition(EnemyState.Death);
    expect(enterLog).toEqual(prevEnter);
  });

  it('Death state has no outbound transitions', () => {
    fsm.transition(EnemyState.Patrol);
    fsm.transition(EnemyState.Aggro);
    fsm.transition(EnemyState.Death);
    expect(fsm.state).toBe(EnemyState.Death);
    expect(fsm.transition(EnemyState.Idle)).toBe(false);
    expect(fsm.transition(EnemyState.Aggro)).toBe(false);
  });

  it('canTransition returns true for a legal move without mutating state', () => {
    expect(fsm.canTransition(EnemyState.Aggro)).toBe(true);
    expect(fsm.state).toBe(EnemyState.Idle);
  });

  it('canTransition returns false for an illegal move', () => {
    // From Idle: Attack is not a valid transition
    expect(fsm.canTransition(EnemyState.Attack)).toBe(false);
  });

  it('does not allow self-transition', () => {
    expect(fsm.transition(EnemyState.Idle)).toBe(false);
    expect(fsm.state).toBe(EnemyState.Idle);
  });

  it('Hurt interrupts Attack mid-combo', () => {
    // Transition: Idle → Aggro → Attack → Hurt
    expect(fsm.transition(EnemyState.Aggro)).toBe(true);
    expect(fsm.transition(EnemyState.Attack)).toBe(true);
    expect(fsm.transition(EnemyState.Hurt)).toBe(true);
    expect(fsm.state).toBe(EnemyState.Hurt);
    expect(exitLog).toContain(EnemyState.Attack);
    expect(enterLog).toContain(EnemyState.Hurt);
  });
});
