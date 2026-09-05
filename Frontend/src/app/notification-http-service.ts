import { Injectable } from '@angular/core';
import { Observable , map } from 'rxjs';
import { Notification

 } from './Model/Notification';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class NotificationHttpService {
  private baseUrl ="http://localhost:8080/api/notifications";
  constructor(private http :HttpClient){}
   getNotifications(): Observable<Notification[]> {
    return this.http.get<any[]>(this.baseUrl).pipe(
      map(list => list.map(json => Notification.fromJson(json)))
    );
  }

  marquerCommeLue(id: number): Observable<Notification> {
    return this.http.patch<any>(`${this.baseUrl}/${id}/lue`, {}).pipe(
      map(json => Notification.fromJson(json))
    );
  }
}
