import { Utilisateur } from "./Utilisateur";

export type StatutTache  = 'A_FAIRE' | 'EN_COURS' | 'TERMINEE'| 'BLOQUEE';
export type PrioriteTache  = 'HAUTE' | 'BASSE' | 'MOYENNE';


export class Tache {
  id!: number;
  titre!: string;
  description!: string;
  statut!: StatutTache;
  echeance!: string;
  projetId!: number;
  dateCreation!: string;
  priorite! :PrioriteTache ;
  dateDebut! : string;
   collaborateurs!: Utilisateur[];
   tauxAvancement !:Number;

  static fromJson(json: any): Tache {
    const tache = new Tache();
    tache.id = json.id;
    tache.titre = json.titre;
    tache.description = json.description;
    tache.statut = json.statut;
    tache.echeance = json.echeance;
    tache.dateDebut=json.dateDebut ;
    tache.projetId = json.projetId;
    tache.dateCreation = json.dateCreation;
    tache.priorite=json.priorite ;
     tache.collaborateurs = json.collaborateurs ?? [];
     tache.tauxAvancement=json.tauxAvancement ;
    return tache;
  }

 
}