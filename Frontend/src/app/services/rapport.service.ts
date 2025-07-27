import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Rapport {
  id: string;
  id_sequence: string;
  prediction_ia: string;
  confiance: number;
  annotation_humaine: string;
  equipe: string;
  joueurs_detectes: number[];
  commentaire_expert: string;
  validation: string;
  annotationId?: string;
  date_annotation?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class RapportService {
  private apiUrl = 'http://localhost:3000/rapport';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  getAllRapports(): Observable<any> {
    return this.http.get(`${this.apiUrl}/getAllRapport`, {
      headers: this.getHeaders()
    });
  }

  getRapportById(id_sequence: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/getRapportById/${id_sequence}`, {
      headers: this.getHeaders()
    });
  }

  createRapport(rapport: Partial<Rapport>): Observable<any> {
    return this.http.post(`${this.apiUrl}/createRapport`, rapport, {
      headers: this.getHeaders()
    });
  }

  updateRapport(id_sequence: string, rapport: Partial<Rapport>): Observable<any> {
    return this.http.patch(`${this.apiUrl}/updateRapport/${id_sequence}`, rapport, {
      headers: this.getHeaders()
    });
  }

  deleteRapport(id_sequence: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/deleteRapport/${id_sequence}`, {
      headers: this.getHeaders()
    });
  }
} 