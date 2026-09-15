import { Injectable } from '@angular/core';
import { ResumeIaResponse } from './Model/ResumeIaResponse';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class ResumeIaService {
  private baseUrl = 'http://localhost:8080/api/projets';

  constructor(private http: HttpClient) {}

  getResume(projetId: number, forcer: boolean = false): Observable<ResumeIaResponse> {
    return this.http.get<ResumeIaResponse>(
      `${this.baseUrl}/${projetId}/resume-ia`,
      { params: { forcer: forcer.toString() } }
    );
  }

}
