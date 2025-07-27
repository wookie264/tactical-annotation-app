import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface AIAnnotationRequest {
  videoId: string;
  annotationId: string;
  videoPath: string;
}

export interface AIAnalysisResponse {
  prediction_ia: string;
  confiance: number;
  joueurs_detectes: number[];
  commentaire_expert: string;
}

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
  annotationId: string;
}

export interface AIAnnotationResult {
  success: boolean;
  rapport: Rapport;
  aiAnalysis: AIAnalysisResponse;
}

@Injectable({
  providedIn: 'root'
})
export class AIAnnotationService {
  private apiUrl = 'http://localhost:3000/ai-annotation';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  processAIAnnotation(request: AIAnnotationRequest): Observable<AIAnnotationResult> {
    return this.http.post<AIAnnotationResult>(`${this.apiUrl}/process`, request, { headers: this.getHeaders() });
  }

  getAIAnnotationsByVideo(videoId: string): Observable<Rapport[]> {
    return this.http.get<Rapport[]>(`${this.apiUrl}/video/${videoId}`, { headers: this.getHeaders() });
  }

  updateRapportValidation(rapportId: string, validation: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/rapport/${rapportId}/validate`, { validation }, { headers: this.getHeaders() });
  }
} 