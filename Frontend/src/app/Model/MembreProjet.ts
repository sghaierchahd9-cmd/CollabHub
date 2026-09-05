export class MembreProjet {
  projetId!: number;
  utilisateurId!: number;
  dateAjout!: string;

  static fromJson(json: any): MembreProjet {
    return Object.assign(new MembreProjet(), json);
  }
}