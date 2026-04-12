import { describe, it, expect, beforeEach } from 'vitest';
import { AttackerCoordinator } from '../enemy/AttackerCoordinator';
import { MAX_SIMULTANEOUS_ATTACKERS } from '../enemy/EnemyConfig';

describe('AttackerCoordinator', () => {
  let coordinator: AttackerCoordinator;

  beforeEach(() => {
    coordinator = new AttackerCoordinator();
  });

  it('grants a token when no attackers are active', () => {
    expect(coordinator.requestAttackToken()).toBe(true);
    expect(coordinator.activeCount).toBe(1);
  });

  it(`grants up to ${MAX_SIMULTANEOUS_ATTACKERS} tokens simultaneously`, () => {
    for (let i = 0; i < MAX_SIMULTANEOUS_ATTACKERS; i++) {
      expect(coordinator.requestAttackToken()).toBe(true);
    }
    expect(coordinator.activeCount).toBe(MAX_SIMULTANEOUS_ATTACKERS);
  });

  it('denies a token when at maximum capacity', () => {
    for (let i = 0; i < MAX_SIMULTANEOUS_ATTACKERS; i++) {
      coordinator.requestAttackToken();
    }
    expect(coordinator.requestAttackToken()).toBe(false);
    expect(coordinator.activeCount).toBe(MAX_SIMULTANEOUS_ATTACKERS);
  });

  it('releases a token and allows a new request', () => {
    for (let i = 0; i < MAX_SIMULTANEOUS_ATTACKERS; i++) {
      coordinator.requestAttackToken();
    }
    coordinator.releaseToken();
    expect(coordinator.activeCount).toBe(MAX_SIMULTANEOUS_ATTACKERS - 1);
    expect(coordinator.requestAttackToken()).toBe(true);
  });

  it('counter does not go below zero on excess release', () => {
    coordinator.releaseToken();
    expect(coordinator.activeCount).toBe(0);
  });

  it('reset() brings count back to zero', () => {
    coordinator.requestAttackToken();
    coordinator.requestAttackToken();
    coordinator.reset();
    expect(coordinator.activeCount).toBe(0);
  });
});
