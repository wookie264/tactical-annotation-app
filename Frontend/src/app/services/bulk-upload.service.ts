import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ManualVideoService, BulkUploadResult } from './manual-video.service';

// Re-export BulkUploadResult for components that import from this service
export type { BulkUploadResult } from './manual-video.service';

@Injectable({
  providedIn: 'root'
})
export class BulkUploadService {
  constructor(private manualVideoService: ManualVideoService) {}

  bulkUpload(files: File[], annotations: any[]): Observable<BulkUploadResult> {
    return this.manualVideoService.bulkUpload(files, annotations);
  }

  // New method for single file upload (for queue system)
  uploadSingleFile(file: File, annotation?: any): Observable<BulkUploadResult> {
    return this.manualVideoService.uploadSingleFile(file, annotation);
  }
} 