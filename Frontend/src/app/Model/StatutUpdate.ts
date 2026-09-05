
import { StatutCollab } from './StatutCollab';

export interface StatutUpdate {
  utilisateurId: number;
  statut: StatutCollab;
  finStatutPrevue: string | null;
}