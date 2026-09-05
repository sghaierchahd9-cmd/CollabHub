import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Projet } from './Model/Projet';
import { Tache } from './Model/tache';
import { Utilisateur } from './Model/Utilisateur';

@Injectable({
  providedIn: 'root',
})
export class ProjetService {
  private geturl = 'http://localhost:8080/api/projets';
  private membersurl ='http://localhost:8080/api/utilisateurs/projet/'
  private tachesurl ='http://localhost:8080/api/taches/projet/'

  constructor(private http :HttpClient) {}
  
  public getProjet() : Observable<Projet[]> {
    return this.http.get<Projet[]>(this.geturl);
  }

  public getMembers(id: number ): Observable<Utilisateur[]>  {
   
    return this.http.get<Utilisateur[]>(this.membersurl+id);
    
   
   
  }
  public getTaches(id: number ): Observable<Tache[]>  {
    return this.http.get<Tache[]>(this.tachesurl+id);

  }

  public postProjet(json :any): Observable<JSON>{
    return this.http.post<JSON>(this.geturl,json);

  }
 public getProjetById(id :Number):Observable<Projet>{
  return this.http.get<Projet>(this.geturl+'/'+id);
 }
 public modifierProjet(projet :Projet):Observable<Projet>{
  return this.http.put<Projet>(this.geturl+'/'+projet.id,projet);

 }
 public getProjetByMembre(id:number): Observable<Projet[]> {
    return this.http.get<Projet[]>(this.geturl+'/membre/'+id);
  }


}





