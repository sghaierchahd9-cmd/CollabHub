import { Injectable } from '@angular/core';
import { Utilisateur } from './Model/Utilisateur';
import { Observable, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import {  LoginResponse } from './Model/LoginResponse';
import { NotificationSocketService } from './notification-socket-service';

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  private _loggedInUser: Utilisateur | null = null;
  private _token: string | null = null;
  private urllogin ="http://localhost:8080/api/auth";
  constructor(private http: HttpClient,private notificationSocketService: NotificationSocketService) {}

  set token(token: string | null) {
    this._token = token;
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }

  get token(): string | null {
    if (!this._token) {
      this._token = localStorage.getItem('token');
    }
    return this._token;
  }
  public getUtilisateur(email :String ,password:String) : Observable<LoginResponse> {
   return this.http.post<LoginResponse>(this.urllogin+"/login",{"email":email,"motDePasse":password}).pipe(
      tap(response => {
        this.notificationSocketService.connecter(response.token);
      })
    );;
   

  }
  set loggedIUser(user: Utilisateur | null) {
    this._loggedInUser = user;
    if (user) {
      localStorage.setItem('currentUser', JSON.stringify(user));
    } else {
      localStorage.removeItem('currentUser');
    }
  }
    get loggedIUser(): Utilisateur | null {
    if (!this._loggedInUser) {
      const stored = localStorage.getItem('currentUser');
      if (stored) {
        this._loggedInUser = Utilisateur.fromJson(JSON.parse(stored));
      }
    }
    return this._loggedInUser;
  }
  public logout(): void {
    this.notificationSocketService.deconnecter();
  this.token = null;
  this.loggedIUser = null;
}
 public reconnecterSiToken(): void {
    const token = this.token;
    if (token) {
      this.notificationSocketService.connecter(token);
    }
  }
  demanderResetMotDePasse(email: string): Observable<void> {
  return this.http.post<void>(`${this.urllogin}/forgot-password`, { email });
}

reinitialiserMotDePasse(token: string, nouveauMotDePasse: string): Observable<void> {
  return this.http.post<void>(`${this.urllogin}/reset-password`, { token, nouveauMotDePasse });
}
}

