
import { Commentaire } from './Model/Commentaire';

/** Recherche récursive d'un commentaire par id, à n'importe quelle profondeur. */
export function trouverCommentaire(arbre: Commentaire[], id: number): Commentaire | null {
  for (const c of arbre) {
    if (c.id === id) return c;
    const trouve = trouverCommentaire(c.reponses, id);
    if (trouve) return trouve;
  }
  return null;
}

/**
 * Insère un nouveau commentaire dans l'arbre.
 * Retourne un NOUVEL arbre (immuabilité) pour que Angular détecte le changement.
 */
export function insererCommentaire(arbre: Commentaire[], nouveau: Commentaire): Commentaire[] {
  if (nouveau.parentId === null) {
    return [...arbre, nouveau];
  }
  return arbre.map(noeud => insererDansNoeud(noeud, nouveau));
}

function insererDansNoeud(noeud: Commentaire, nouveau: Commentaire): Commentaire {
  if (noeud.id === nouveau.parentId) {
    return { ...noeud, reponses: [...noeud.reponses, nouveau] };
  }
  if (noeud.reponses.length > 0) {
    return { ...noeud, reponses: insererCommentaire(noeud.reponses, nouveau) };
  }
  return noeud;
}

/**
 * Remplace un commentaire existant par sa version à jour (édition).
 */
export function mettreAJourCommentaire(arbre: Commentaire[], maj: Commentaire): Commentaire[] {
  return arbre.map(c => {
    if (c.id === maj.id) return maj;
    return { ...c, reponses: mettreAJourCommentaire(c.reponses, maj) };
  });
}

export function upsertCommentaire(arbre: Commentaire[], commentaire: Commentaire): Commentaire[] {
  const existeDeja = trouverCommentaire(arbre, commentaire.id) !== null;
  return existeDeja
    ? mettreAJourCommentaire(arbre, commentaire)
    : insererCommentaire(arbre, commentaire);
}

/** Retire un commentaire (soft-delete) à n'importe quelle profondeur. */
export function retirerCommentaire(arbre: Commentaire[], id: number): Commentaire[] {
  return arbre
    .filter(c => c.id !== id)
    .map(c => ({ ...c, reponses: retirerCommentaire(c.reponses, id) }));
}