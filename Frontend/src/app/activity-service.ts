import { Injectable } from '@angular/core';
import { Activity } from './Model/Activity';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class ActivityService {
  private url="http://localhost:8080/api/activities";
  constructor(private http : HttpClient){}

  public getActivitiesParProjet(projetId :number):Observable<Activity[]>{
    return this.http.get<Activity[]>(this.url + '/projet/'+projetId);
  }
}
