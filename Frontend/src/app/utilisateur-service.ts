import { Utilisateur } from './Model/Utilisateur';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable,map } from 'rxjs';
import { Equipe } from './Model/Equipe';
import { ModeTravail} from './Model/ModeTravail';
import { StatutCollab } from './Model/StatutCollab';
@Injectable({
  providedIn: 'root',
})

export class UtilisateurService {
  
  private urlusers = "http://localhost:8080/api/utilisateurs";
  utilisateurs :Utilisateur[] = [];
  constructor(private http : HttpClient){}

 
 public addUtilisateur(utilisateur: Utilisateur): void  {
  this.utilisateurs.push(utilisateur);}

  public getUtilisateurs(): Observable<Utilisateur[]> {
    return this.http.get<Utilisateur[]>(`${this.urlusers}`);
  }
  public getUtilisateursByrole(role:string) : Observable<Utilisateur[]> {
    return this.http.get<Utilisateur[]>(this.urlusers+'/role/'+role);
  }
  public getmembersEquipe(id : Number):Observable<Utilisateur[]> {
    return this.http.get<Utilisateur[]>(this.urlusers+'/membres/'+ id);
  }
  public getEquipe(id :Number | undefined ):Observable<Equipe[]>{
    return this.http.get<Equipe[]>(this.urlusers +'/equipe/'+id) ;
  }
  public creerUtilisateur(data: any):Observable<Utilisateur>{
    return this.http.post<Utilisateur>(this.urlusers,data);
  }
  public getResponsablesTaches(id :number):Observable<Utilisateur[]>{
    return this.http.get<Utilisateur[]>(this.urlusers+'/tache/'+id);
  }
  public getCollaborateurs(id:number ):Observable<Utilisateur[]>{
    return this.http.get<Utilisateur[]>(this.urlusers+'/projet/'+id);
  }
  public getUtilisateurById(id:number):Observable<Utilisateur> {
    return this.http.get<Utilisateur>(this.urlusers+'/'+id);
  }
  public deleteMembre(id:number):Observable<any>{
     return this.http.delete<any>(this.urlusers+'/'+id);
  }
  updateProfil(id: number, data: { nom: string; prenom: string; modeTravail: ModeTravail }): Observable<Utilisateur> {
  return this.http.put<Utilisateur>(`${this.urlusers}/profil/${id}`, data);
}

updatePassword(id: number, data: { currentPassword: string; newPassword: string }): Observable<any> {
  return this.http.put(`${this.urlusers}/password/${id}`, data, { responseType: 'text' });
}

updateStatut(data: { statut: StatutCollab; finPrevue: string | null }): Observable<Utilisateur> {
  return this.http.post<Utilisateur>(`${this.urlusers}/statut`, data);
}
uploaderPhotoProfil(fichier: File): Observable<Utilisateur> {
  const formData = new FormData();
  formData.append('fichier', fichier);

  return this.http.post<any>(`${this.urlusers}/photo-profil`, formData)
    .pipe(map(json => Utilisateur.fromJson(json)));
}
  
}