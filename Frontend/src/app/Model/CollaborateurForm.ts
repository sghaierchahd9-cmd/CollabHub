
export type ModeTravail = 'SUR_SITE' | 'A_DISTANCE';

export interface CollaborateurForm {
  nom: string;
  prenom: string;
  email: string;
  motDePasse: string;
  role: 'CHEF_DE_PROJET' | 'COLLABORATEUR';
  modeTravail: ModeTravail;
  equipeId: number | null;
}