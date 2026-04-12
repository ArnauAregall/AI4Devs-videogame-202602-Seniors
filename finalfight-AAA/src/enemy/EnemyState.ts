/**
 * Enemy AI state enum. Seven values shared by all archetypes.
 *
 * @spec enemy-state
 * @implements FR-EA-05 through FR-EA-13
 */
export enum EnemyState {
  Idle      = 'Idle',
  Patrol    = 'Patrol',
  Aggro     = 'Aggro',
  Attack    = 'Attack',
  Hurt      = 'Hurt',
  Knockdown = 'Knockdown',
  Death     = 'Death',
}
