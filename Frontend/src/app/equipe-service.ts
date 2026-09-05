import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Equipe } from './Model/Equipe';
import { Utilisateur } from './Model/Utilisateur';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class EquipeService {
  private equipesurl = "http://localhost:8080/api/equipes";
  constructor(private http: HttpClient) {}

  public getequipes(): Observable<Equipe[]> {
    return this.http.get<Equipe[]>(this.equipesurl);
  }

  public creerEquipe(data: { nom: string; description?: string }): Observable<Equipe> {
    return this.http.post<Equipe>(this.equipesurl, data);
  }

  public updateEquipe(id: number, data: { nom: string; description?: string }): Observable<Equipe> {
    return this.http.put<Equipe>(`${this.equipesurl}/${id}`, data);
  }

  public deleteEquipe(id: number): Observable<void> {
    return this.http.delete<void>(`${this.equipesurl}/${id}`);
  }

  public ajouterMembre(equipeId: number, userId: number): Observable<Utilisateur> {
    return this.http.post<Utilisateur>(`${this.equipesurl}/${equipeId}/membres/${userId}`, {});
  }

  public retirerMembre(equipeId: number, userId: number): Observable<void> {
    return this.http.delete<void>(`${this.equipesurl}/${equipeId}/membres/${userId}`);
  }
}