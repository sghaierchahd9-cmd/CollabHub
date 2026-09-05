
export enum ModeTravail {
  A_DISTANCE = 'A_DISTANCE',
  SUR_SITE = 'SUR_SITE'
}

export const ModeTravailLabels: Record<ModeTravail, string> = {
  [ModeTravail.A_DISTANCE]: 'À distance',
  [ModeTravail.SUR_SITE]: 'Sur site'
};