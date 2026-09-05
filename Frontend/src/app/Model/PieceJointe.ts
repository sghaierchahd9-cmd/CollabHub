
export class PieceJointe {
  id!: number;
  nomFichier!: string;
  urlStockage!: string;
  tacheId!: number;
  userId!: number;
  dateUpload!: string;

  static fromJson(json: any): PieceJointe {
    return Object.assign(new PieceJointe(), json);
  }
}