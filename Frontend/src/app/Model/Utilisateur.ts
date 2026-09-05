export type RoleUtilisateur = 'ADMINISTRATEUR' | 'COLLABORATEUR' | 'CHEF_PROJET';
import { ModeTravail } from "./ModeTravail";
import { StatutCollab } from "./StatutCollab";

export class Utilisateur {
  id!: number;
  nom!: string;
  prenom!: string;
  email!: string;

  equipeIds!: number[];
  role!: RoleUtilisateur;
  modeTravail!: ModeTravail;
  statutActivite!: StatutCollab;
  dateCreation!: string;
  dateSuppression?: string | null;
  nbProjets? : Number | null;
  nbTaches? : Number | null ;
  photoProfilUrl? : string | null ;


  
   static fromJson(json: any): Utilisateur {
    return Object.assign(new Utilisateur(), json);
  }
  get estActif(): boolean {
    return this.dateSuppression == null;
  }

  
}