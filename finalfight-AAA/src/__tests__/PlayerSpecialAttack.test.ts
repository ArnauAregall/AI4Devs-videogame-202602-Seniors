import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GameConfig } from '../config/GameConfig';
import { PlayerState } from '../player/PlayerState';

const mocks = vi.hoisted(() => {
  const spriteMock = {
    x: 0, y: 0,
    setFlipX: vi.fn(),
    setDepth: vi.fn(),
    play: vi.fn(),
    anims: { setRepeat: vi.fn(), currentAnim: null },
    on: vi.fn(),
    off: vi.fn(),
    destroy: vi.fn(),
    scene: null as unknown,
  };

  const hitboxMock = { setPosition: vi.fn(), destroy: vi.fn() };

  const sceneMock = {
    input:   { keyboard: { addKey: vi.fn(() => ({ isDown: false })), on: vi.fn() }, gamepad: { on: vi.fn(), pad1: null } },
    physics: { add: { sprite: vi.fn(() => spriteMock), staticGroup: vi.fn(() => ({ create: vi.fn(() => hitboxMock) })) } },
    anims:   { exists: vi.fn(() => true), create: vi.fn(), generateFrameNumbers: vi.fn(() => []) },
    registerFixedUpdate:   vi.fn(),
    unregisterFixedUpdate: vi.fn(),
    triggerGameOver:       vi.fn(),
    playerHitboxGroup:     { create: vi.fn(() => hitboxMock) },
  };
  spriteMock.scene = sceneMock;
  return { spriteMock, sceneMock };
});

vi.mock('phaser', () => ({
  default: {
    Scene: class {},
    Input: { Keyboard: { KeyCodes: { LEFT:'L',RIGHT:'R',UP:'U',DOWN:'D',A:'A',D:'D2',W:'W',S:'S',Z:'Z',J:'J',X:'X',K:'K',C:'C',L:'L2',SPACE:'SP',ENTER:'EN' }, JustDown: vi.fn(() => false) }, Gamepad: {} },
    Math: { Clamp: (v: number, lo: number, hi: number) => Math.min(Math.max(v, lo), hi) },
    AUTO: 0,
    Scale: { FIT: 'FIT', NONE: 'NONE', CENTER_BOTH: 'CENTER_BOTH' },
  },
  Scene: class {},
}));

import { PlayerController, type CombatBus } from '../player/PlayerController';

describe('PlayerSpecialAttack', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.spriteMock.x = 0;
    mocks.spriteMock.y = 0;
    (mocks.sceneMock.physics.add.sprite as ReturnType<typeof vi.fn>).mockReturnValue(mocks.spriteMock);
  });

  // ── Health cost guard ──────────────────────────────────────────────────
  it('allows SpecialAttack when HP >= SPECIAL_ATTACK_HP_COST and cooldown is 0', () => {
    const controller = new PlayerController(mocks.sceneMock as unknown as Parameters<typeof PlayerController>[0], 100, 150);
    expect(controller.hp).toBeGreaterThanOrEqual(GameConfig.SPECIAL_ATTACK_HP_COST);

    const fsm = (controller as unknown as { _stateMachine: { current: PlayerState; transition: (s: PlayerState) => boolean } })._stateMachine;
    const didTransition = fsm.transition(PlayerState.SpecialAttack);
    expect(didTransition).toBe(true);
    expect(controller.hp).toBe(GameConfig.PLAYER_MAX_HP - GameConfig.SPECIAL_ATTACK_HP_COST);
  });

  it('deducts SPECIAL_ATTACK_HP_COST on SpecialAttack entry', () => {
    const controller = new PlayerController(mocks.sceneMock as unknown as Parameters<typeof PlayerController>[0], 100, 150);
    const hpBefore = controller.hp;
    const fsm = (controller as unknown as { _stateMachine: { transition: (s: PlayerState) => boolean } })._stateMachine;
    fsm.transition(PlayerState.SpecialAttack);
    expect(controller.hp).toBe(hpBefore - GameConfig.SPECIAL_ATTACK_HP_COST);
  });

  it('sets specialCooldownTicks to SPECIAL_COOLDOWN_TICKS after use', () => {
    const controller = new PlayerController(mocks.sceneMock as unknown as Parameters<typeof PlayerController>[0], 100, 150);
    const fsm = (controller as unknown as { _stateMachine: { transition: (s: PlayerState) => boolean } })._stateMachine;
    fsm.transition(PlayerState.SpecialAttack);
    expect(controller.specialCooldownTicks).toBe(GameConfig.SPECIAL_COOLDOWN_TICKS);
  });

  // ── Cooldown blocks repeat ─────────────────────────────────────────────
  it('blocks SpecialAttack when cooldown > 0 (via _processInput guard)', () => {
    const controller = new PlayerController(mocks.sceneMock as unknown as Parameters<typeof PlayerController>[0], 100, 150);
    const fsm = (controller as unknown as { _stateMachine: { current: PlayerState; transition: (s: PlayerState) => boolean } })._stateMachine;
    fsm.transition(PlayerState.SpecialAttack);
    fsm.current = PlayerState.Idle;

    const hpAfterFirst = controller.hp;
    const processInput = (controller as unknown as { _processInput: (input: ReturnType<typeof Object.create>) => void })._processInput.bind(controller);
    processInput({ left: false, right: false, up: false, down: false, jump: false, lightAttack: false, heavyAttack: false, grab: false, specialAttack: true });

    expect(controller.hp).toBe(hpAfterFirst);
    expect(controller.specialCooldownTicks).toBeGreaterThan(0);
  });

  it('cooldown reaches 0 after SPECIAL_COOLDOWN_TICKS fixedUpdate calls', () => {
    const controller = new PlayerController(mocks.sceneMock as unknown as Parameters<typeof PlayerController>[0], 100, 150);
    controller.specialCooldownTicks = GameConfig.SPECIAL_COOLDOWN_TICKS;

    for (let i = 0; i < GameConfig.SPECIAL_COOLDOWN_TICKS; i++) {
      const tick = (controller as unknown as { _tickCountdowns: () => void })._tickCountdowns.bind(controller);
      tick();
    }
    expect(controller.specialCooldownTicks).toBe(0);
  });

  // ── dispatchAreaDamage ──────────────────────────────────────────────────
  it('calls combatBus.dispatchAreaDamage with correct radius on SpecialAttack', () => {
    const mockBus: CombatBus = { dispatchAreaDamage: vi.fn() };
    const controller = new PlayerController(
      mocks.sceneMock as unknown as Parameters<typeof PlayerController>[0],
      100, 150,
      mockBus,
    );
    const fsm = (controller as unknown as { _stateMachine: { transition: (s: PlayerState) => boolean } })._stateMachine;
    fsm.transition(PlayerState.SpecialAttack);

    expect(mockBus.dispatchAreaDamage).toHaveBeenCalledOnce();
    expect(mockBus.dispatchAreaDamage).toHaveBeenCalledWith(controller, GameConfig.SPECIAL_ATTACK_RADIUS);
  });

  it('does NOT call dispatchAreaDamage when combatBus is null', () => {
    const controller = new PlayerController(
      mocks.sceneMock as unknown as Parameters<typeof PlayerController>[0],
      100, 150,
      null,
    );
    const fsm = (controller as unknown as { _stateMachine: { transition: (s: PlayerState) => boolean } })._stateMachine;
    expect(() => fsm.transition(PlayerState.SpecialAttack)).not.toThrow();
  });
});
