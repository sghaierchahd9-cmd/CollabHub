
export enum StatutCollab {
  DISPONIBLE = 'DISPONIBLE',
  EN_REUNION = 'EN_REUNION',
  EN_PAUSE = 'EN_PAUSE',
  HORS_LIGNE = 'HORS_LIGNE'
}

export const StatutCollabConfig: Record<StatutCollab, { label: string; color: string; requiresFin: boolean }> = {
  [StatutCollab.DISPONIBLE]: { label: 'Disponible', color: '#22c55e', requiresFin: false },
  [StatutCollab.EN_REUNION]:  { label: 'En réunion', color: '#f59e0b', requiresFin: true },
  [StatutCollab.EN_PAUSE]:    { label: 'En pause',   color: '#749cd4', requiresFin: true },
  [StatutCollab.HORS_LIGNE]:  { label: 'Hors ligne', color: '#6b7280', requiresFin: false }
};