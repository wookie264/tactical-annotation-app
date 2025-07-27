import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Video {
  id: string;
  path: string;
  filename?: string;
}

export interface BulkUploadResult {
  videos: Video[];
  annotations: any[];
  errors: Array<{ file?: string; annotation?: string; error: string }>;
}

@Injectable({
  providedIn: 'root'
})
export class ManualVideoService {
  private apiUrl = 'http://localhost:3000/manual-video';

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

  bulkUpload(files: File[], annotations: any[]): Observable<BulkUploadResult> {
    console.log('🚀 Frontend manual video bulk upload started');
    console.log('📁 Files to upload:', files.length);
    console.log('📝 Annotations to upload:', annotations?.length || 0);
    console.log('📝 Annotations data:', annotations);
    
    const formData = new FormData();
    
    // Add all files
    files.forEach(file => {
      formData.append('files', file);
      console.log('📁 Added file to FormData:', file.name);
    });

    // Add annotations as JSON string
    if (annotations && annotations.length > 0) {
      const annotationsJson = JSON.stringify(annotations);
      formData.append('annotations', annotationsJson);
      console.log('📝 Added annotations to FormData:', annotationsJson);
    } else {
      console.log('⚠️ No annotations to add to FormData');
    }

    console.log('🌐 Sending request to:', `${this.apiUrl}/bulkUpload`);

    return this.http.post<{ status: string; data: BulkUploadResult }>(`${this.apiUrl}/bulkUpload`, formData, {
      headers: this.getHeaders()
    }).pipe(
      map(response => response.data) // Extract the data from the response
    );
  }

  // New method for single file upload (for queue system)
  uploadSingleFile(file: File, annotation?: any): Observable<BulkUploadResult> {
    console.log('🚀 Frontend single file upload started');
    console.log('📁 File to upload:', file.name);
    console.log('📝 Annotation provided:', !!annotation);
    
    const formData = new FormData();
    formData.append('file', file);
    
    // Add annotation as JSON string if provided
    if (annotation) {
      const annotationJson = JSON.stringify(annotation);
      formData.append('annotation', annotationJson);
      console.log('📝 Added annotation to FormData:', annotationJson);
    }

    console.log('🌐 Sending request to:', `${this.apiUrl}/uploadSingleFile`);

    return this.http.post<{ status: string; data: BulkUploadResult }>(`${this.apiUrl}/uploadSingleFile`, formData, {
      headers: this.getHeaders()
    }).pipe(
      map(response => response.data) // Extract the data from the response
    );
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