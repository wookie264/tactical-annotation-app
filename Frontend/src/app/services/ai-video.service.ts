import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Video {
  id: string;
  path: string;
  filename?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AIVideoService {
  private apiUrl = 'http://localhost:3000/ai-video';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  getAllVideos(): Observable<any> {
    return this.http.get(`${this.apiUrl}/getAllVideos`, {
      headers: this.getHeaders()
    });
  }

  getVideoById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/getVideoById/${id}`, {
      headers: this.getHeaders()
    });
  }

  uploadVideo(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('video', file);

    return this.http.post(`${this.apiUrl}/uploadVideo`, formData, {
      headers: this.getHeaders()
    });
  }

  updateVideo(id: string, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/updateVideo/${id}`, data, {
      headers: this.getHeaders()
    });
  }

  deleteVideo(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/deleteVideo/${id}`, {
      headers: this.getHeaders()
    });
  }

  // Generate id_sequence from filename
  generateIdSequence(filename: string): string {
    return filename.replace(/\.[^/.]+$/, '');
  }
} 