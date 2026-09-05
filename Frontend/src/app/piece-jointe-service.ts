import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PieceJointe } from './Model/PieceJointe';

@Injectable({ providedIn: 'root' })
export class PieceJointeService {
  private readonly baseUrl = `http://localhost:8080/api/pieces-jointes`;

  constructor(private http: HttpClient) {}

  getByTache(tacheId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/tache/${tacheId}`);
  }

  upload(tacheId: number, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('tacheId', tacheId.toString());
    formData.append('file', file);
    return this.http.post<any>(this.baseUrl, formData);
  }

  download(id: number): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/${id}/download`, { responseType: 'blob' });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
  renommer(id:number, nom:string): Observable<PieceJointe> {
    return this.http.put<PieceJointe>(`${this.baseUrl}/${id}`,{nomFichier : nom});
  }
}