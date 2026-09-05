// TypeNotification.ts
export enum TypeNotification {
  COMMENTAIRE_TACHE = 'COMMENTAIRE_TACHE',
  COMMENTAIRE_PROJET = 'COMMENTAIRE_PROJET',
  AFFECTATION_TACHE = 'AFFECTATION_TACHE',
  RETRAIT_TACHE = 'RETRAIT_TACHE',
  TACHE_BLOQUEE = 'TACHE_BLOQUEE',
  ATTACHER_PIECEJOINTE  = "ATTACHER_PIECE_JOINTE",
  SUPPRIMER_PIECEJOINTE ="SUPPRIMER_PIECEJOINTE",
  CREER_PROJET= "CREER_PROJET",
  MODIFIER_PROJET="MODIFIER_PROJET",
   ECHEANCE_PROCHE="ECHEANCE_PROCHE",
    ECHEANCE_DEPASSEE="ECHEANCE_DEPASSE"

}

export class Notification {
id!:number;
message!:string;
typeEvenement!:TypeNotification;
estLue!: boolean;
dateGeneration!: string;
dateSuppression!: string ;

  static fromJson(json: any): Notification {
    return Object.assign(new Notification(), json);
  }


}