import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Video {
  id: string;
  path: string;
  filename?: string;
  annotations?: Annotation[];
}

export interface Annotation {
  id: string;
  id_sequence: string;
  annotation: string;
  validateur: string;
  date_annotation?: Date;
  commentaire: string;
  domicile: string;
  visiteuse: string;
  videoId: string;
}

@Injectable({
  providedIn: 'root'
})
export class VideoService {
  private apiUrl = 'http://localhost:3000/video'; // Adjust port as needed

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  uploadVideo(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('video', file);

    // For file uploads, we need to set the Authorization header manually
    // since FormData doesn't automatically include it
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.post(`${this.apiUrl}/uploadVideo`, formData, {
      headers: headers
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

  deleteVideo(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/deleteVideo/${id}`, {
      headers: this.getHeaders()
    });
  }

  // Helper method to generate id_sequence from filename
  generateIdSequence(filename: string): string {
    return filename.replace(/\.[^/.]+$/, ''); // Remove file extension
  }
} 