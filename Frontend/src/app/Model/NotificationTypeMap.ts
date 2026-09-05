// Model/type-notification.utils.ts
import { TypeNotification } from './Notification';

const LIBELLES: Record<TypeNotification, string> = {
  [TypeNotification.COMMENTAIRE_TACHE]: 'Commentaire sur tâche',
  [TypeNotification.COMMENTAIRE_PROJET]: 'Commentaire sur projet',
  [TypeNotification.AFFECTATION_TACHE]: 'Affectation',
  [TypeNotification.RETRAIT_TACHE]: 'Retrait',
  [TypeNotification.TACHE_BLOQUEE]: 'Tâche bloquée',
  [TypeNotification.SUPPRIMER_PIECEJOINTE]: 'Piece jointe supprimée',
  [TypeNotification.ATTACHER_PIECEJOINTE]: 'Piece jointe attachée',
  [TypeNotification.CREER_PROJET]: "Creation d'un projet",
  [TypeNotification.MODIFIER_PROJET]: "Modification d'un projet",
  [TypeNotification.ECHEANCE_PROCHE]: "échéance approchante",
  [TypeNotification.ECHEANCE_DEPASSEE]:"échéance dépassée"
};

export function libelleTypeNotification(type: TypeNotification): string {
  return LIBELLES[type] ?? type;
}

export function estUrgente(type: TypeNotification): boolean {
  return type === TypeNotification.TACHE_BLOQUEE || type=== TypeNotification.SUPPRIMER_PIECEJOINTE || type=== TypeNotification.ECHEANCE_DEPASSEE;
}