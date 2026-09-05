import { Injectable } from '@angular/core';
import { Tache } from './Model/tache';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TacheService {
  taches: Tache[] = [];
   private  tacheurl = "http://localhost:8080/api/taches";
  constructor(private http: HttpClient) {}

  public getTaches(): Observable<Tache[]> {
    return this.http.get<Tache[]>(this.tacheurl);
  }
  public changerStatut(id:Number , statut: String): Observable<Tache>{
    return this.http.patch<Tache>(this.tacheurl+'/statut/'+id,{"statut" : statut})

  }
  public getTacheByProjet(id:Number): Observable<Tache[]> {
    return this.http.get<Tache[]>(this.tacheurl+'/projet/'+id);
  }
  public creerTache(tache:Tache): Observable<Tache>{
    return this.http.post<Tache>(this.tacheurl,tache);}
  public modifierTache(id: number, tache: Tache): Observable<Tache> {
  return this.http.put<Tache>(this.tacheurl + '/' + id, tache);
}
// tache.service.ts
getTachesParMembre(projetId: number, membreId: number): Observable<Tache[]> {
  return this.http.get<Tache[]>(`${this.tacheurl}/projet/${projetId}/membre/${membreId}`);
}
mettreAJourAvancement(id: number, tauxAvancement: number): Observable<any> {
  return this.http.patch<any>(`${this.tacheurl}/avancement/${id}`, { tauxAvancement : tauxAvancement});
}
getTachesForMembre(id:number):Observable<Tache[]> {
  return this.http.get<Tache[]>(`${this.tacheurl}/membre/${id}`);
}
}
