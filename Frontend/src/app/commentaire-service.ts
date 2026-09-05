import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Commentaire } from './Model/Commentaire';

export interface NouveauCommentairePayload {
  contenu: string;
  parentId?: number;
  mentionIds: number[];
}

@Injectable({
  providedIn: 'root',
})
export class CommentaireService {
  private apiUrl = 'http://localhost:8080/api/commentaires';

  constructor(private http: HttpClient) {}

  getCommentairesTache(tacheId: number): Observable<Commentaire[]> {
    return this.http.get<Commentaire[]>(`${this.apiUrl}/tache/${tacheId}`);
  }

  getCommentairesProjet(projetId: number): Observable<Commentaire[]> {
    return this.http.get<Commentaire[]>(`${this.apiUrl}/projet/${projetId}`);
  }

  ajouterCommentaireTache(tacheId: number, payload: NouveauCommentairePayload): Observable<Commentaire> {
    return this.http.post<Commentaire>(`${this.apiUrl}/tache/${tacheId}`, payload);
  }

  ajouterCommentaireProjet(projetId: number, payload: NouveauCommentairePayload): Observable<Commentaire> {
    return this.http.post<Commentaire>(`${this.apiUrl}/projet/${projetId}`, payload);
  }

 modifierCommentaire(id: number, contenu: string, mentionIds: number[]): Observable<Commentaire> {
  return this.http.patch<Commentaire>(`${this.apiUrl}/${id}`, { contenu, mentionIds });
}

  supprimerCommentaire(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`); // était http.get — bug corrigé
  }
}