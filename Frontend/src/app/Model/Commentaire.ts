// commentaire.model.ts
import { Utilisateur } from "./Utilisateur";

export class Commentaire {
  id!: number;
  contenu!: string;
  user!: Utilisateur;
  dateCreation!: string;
  dateSuppression: string | null = null;
  parentId: number | null = null;     // ← nouveau
  mentionIds: number[] = [];
  reponses: Commentaire[] = [];

  static fromJson(json: any): Commentaire {
    const c = new Commentaire();
    c.id = json.id;
    c.contenu = json.contenu;
    c.user = Utilisateur.fromJson(json.auteur);
    c.dateCreation = json.dateCreation;
    c.dateSuppression = json.dateSuppression ?? null;
    c.parentId = json.parentId ?? null;
    c.mentionIds = json.mentionIds ?? [];
    c.reponses = (json.reponses ?? []).map((r: any) => Commentaire.fromJson(r));
    return c;
  }
}