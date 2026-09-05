export class AffectationTache {
  tacheId!: number;
  utilisateurId!: number;
  dateAffectation!: string;

  static fromJson(json: any): AffectationTache {
    return Object.assign(new AffectationTache(), json);
  }
}