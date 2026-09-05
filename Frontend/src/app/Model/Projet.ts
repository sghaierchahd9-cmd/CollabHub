export type StatutProjet = 'EN_COURS' | 'TERMINE' | 'ARCHIVE' | 'PLANIFIER' | 'SUSPENDU';

export class Projet {
   id!: number;
  nom!: string;
  description!: string;
  dateDebut!: string;
  dateFinPrevue!: string;
  statut!: StatutProjet;
  dateCreation!: string;
  objectifs!: string;
  niveauPriorite!: string;
  chefProjet!:number;
  collaborateurIds!: number[];
  static fromJson(json: any): Projet {
    return Object.assign(new Projet(), json);
  }

  get estArchive(): boolean {
    return this.statut === 'ARCHIVE';
  }
}