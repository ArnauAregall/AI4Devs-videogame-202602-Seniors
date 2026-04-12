/**
 * All legal states for the player character.
 * @spec player-state-machine – Requirement: PlayerState enum defines all legal states
 * @implements FR-PL-01 through FR-PL-11
 */
export enum PlayerState {
  Idle          = 'Idle',
  Walk          = 'Walk',
  Jump          = 'Jump',
  LightAttack   = 'LightAttack',
  HeavyAttack   = 'HeavyAttack',
  JumpAttack    = 'JumpAttack',
  Grab          = 'Grab',
  Hurt          = 'Hurt',
  Knockdown     = 'Knockdown',
  GetUp         = 'GetUp',
  SpecialAttack = 'SpecialAttack',
}
