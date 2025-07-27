import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BulkUploadService, BulkUploadResult } from '../services/bulk-upload.service';
import JSZip from 'jszip';

interface JsonObject {
  id_sequence: string;
  annotation: string;
  validateur: string;
  date_annotation: string;
  commentaire: string;
  domicile?: string;
  visiteuse?: string;
}

interface UploadFile {
  file: File;
  type: 'video' | 'json';
  id_sequence?: string;
  correspondingJson?: string;
  status: 'pending' | 'processing' | 'success' | 'error';
  error?: string;
  progress?: number;
}

@Component({
  selector: 'app-bulk-upload',
  imports: [CommonModule],
  templateUrl: './bulk-upload.html',
  styleUrl: './bulk-upload.css'
})
export class BulkUpload {
  @Output() goBackEvent = new EventEmitter<void>();
  
  // Make Math available in template
  Math = Math;
  
  isProcessing = false;
  processingError: string | null = null;
  processingSuccess = false;
  processingResult: BulkUploadResult | null = null;
  
  // JSON Splitter
  selectedJsonFile: File | null = null;
  jsonFileName: string | null = null;
  processedJsonFiles: { filename: string; content: string }[] = [];
  isJsonProcessing = false;
  jsonProcessingError: string | null = null;
  jsonProcessingSuccess = false;
  isDownloading = false;
  
  // File Upload
  uploadedFiles: UploadFile[] = [];
  isDragOver = false;
  uploadError: string | null = null;
  uploadSuccess = false;
  
  // Queue System
  isQueueProcessing = false;
  queueProgress = 0;
  processedCount = 0;
  successCount = 0;
  errorCount = 0;
  currentProcessingIndex = -1;

  constructor(private bulkUploadService: BulkUploadService) {}

  goBack() {
    this.goBackEvent.emit();
  }

  // JSON Splitter Methods
  onJsonFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      
      if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
        this.jsonProcessingError = 'Veuillez sélectionner un fichier JSON valide.';
        return;
      }

      this.selectedJsonFile = file;
      this.jsonFileName = file.name;
      this.jsonProcessingError = null;
      this.jsonProcessingSuccess = false;
      this.processedJsonFiles = [];
    }
  }

  processJsonFile() {
    if (!this.selectedJsonFile) {
      this.jsonProcessingError = 'Aucun fichier sélectionné';
      return;
    }

    this.isJsonProcessing = true;
    this.jsonProcessingError = null;
    this.jsonProcessingSuccess = false;
    this.processedJsonFiles = [];

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const jsonData = JSON.parse(content);
        
        if (!Array.isArray(jsonData)) {
          this.jsonProcessingError = 'Le fichier JSON doit contenir un tableau d\'objets.';
          this.isJsonProcessing = false;
          return;
        }

        this.splitJsonObjects(jsonData);
        
        this.isJsonProcessing = false;
        this.jsonProcessingSuccess = true;
        
      } catch (error) {
        this.isJsonProcessing = false;
        this.jsonProcessingError = 'Erreur lors du parsing du fichier JSON.';
        // JSON parsing error
      }
    };

    reader.readAsText(this.selectedJsonFile);
  }

  private splitJsonObjects(jsonArray: JsonObject[]) {
    const processedFiles: { filename: string; content: string }[] = [];
    let validCount = 0;
    let invalidCount = 0;

    // Processing JSON array

    jsonArray.forEach((obj, index) => {
      // Processing object
      
      // Check each required field individually (domicile and visiteuse are optional)
      const missingFields = [];
      if (!obj.id_sequence) missingFields.push('id_sequence');
      if (!obj.annotation) missingFields.push('annotation');
      if (!obj.validateur) missingFields.push('validateur');
      
      if (missingFields.length > 0) {
        // Object missing required fields
        invalidCount++;
        return;
      }

      const filename = `${obj.id_sequence}.json`;
      const jsonContent = JSON.stringify(obj, null, 2);
      
      processedFiles.push({
        filename,
        content: jsonContent
      });
      
      validCount++;
    });

    this.processedJsonFiles = processedFiles;
          // Successfully processed objects
    // Skipped invalid objects
    
    if (invalidCount > 0) {
      this.jsonProcessingError = `${invalidCount} objets invalides ignorés. Vérifiez que tous les objets ont les champs requis: id_sequence, annotation, validateur`;
    }
  }

  downloadAllJsonFiles() {
    // Starting download
    
    if (this.processedJsonFiles.length === 0) {
      // No files to download
      return;
    }

    this.isDownloading = true;

    // Download files with a small delay between each to avoid browser blocking
    this.processedJsonFiles.forEach((file, index) => {
      setTimeout(() => {
        this.downloadFile(file.filename, file.content);
        
        // Set downloading to false after the last file
        if (index === this.processedJsonFiles.length - 1) {
          setTimeout(() => {
            this.isDownloading = false;
          }, 200);
        }
      }, index * 100); // 100ms delay between each download
    });
  }

  async downloadAsZip() {
    // Creating zip file
    
    if (this.processedJsonFiles.length === 0) {
      // No files to download
      return;
    }

    this.isDownloading = true;

    try {
      const zip = new JSZip();
      
      // Add each file to the zip
      this.processedJsonFiles.forEach(file => {
        zip.file(file.filename, file.content);
      });
      
      // Generate the zip file
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      
      // Download the zip file
      const url = URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'annotations.zip';
      link.style.display = 'none';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up
      setTimeout(() => {
        URL.revokeObjectURL(url);
        this.isDownloading = false;
      }, 1000);
      
      // Zip download completed
    } catch (error) {
      // Zip download failed
      this.isDownloading = false;
    }
  }

  downloadIndividualFile(filename: string, content: string) {
    try {
      // Downloading individual file
      this.downloadFile(filename, content);
    } catch (error) {
      // Individual download failed
    }
  }

  downloadFile(filename: string, content: string) {
    try {
      // Downloading file
      
      const blob = new Blob([content], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.style.display = 'none';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up the URL after a short delay
      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 1000);
      
      // Download completed
    } catch (error) {
      // Download failed
    }
  }

  // File Upload Methods
  async onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      await this.handleFiles(Array.from(input.files));
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = false;
  }

  async onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = false;
    
    if (event.dataTransfer?.files) {
      await this.handleFiles(Array.from(event.dataTransfer.files));
    }
  }

  private async handleFiles(files: File[]) {
    // Check if adding these files would exceed the limit
    const currentCount = this.uploadedFiles.length;
    const newFilesCount = files.length;

    // First, process all JSON files
    for (const file of files) {
      const fileType = this.getFileType(file);
      if (fileType === 'json') {
        await this.processIndividualJsonFile(file);
      }
    }

    // Then, process all files and match them
    for (const file of files) {
      const uploadFile: UploadFile = {
        file: file,
        type: this.getFileType(file),
        status: 'pending',
        progress: 0
      };
      
      // Try to find corresponding JSON file
      if (uploadFile.type === 'video') {
        const videoName = file.name.replace(/\.[^/.]+$/, '');
        const correspondingJson = this.processedJsonFiles.find(json => 
          json.filename === `${videoName}.json`
        );
        if (correspondingJson) {
          uploadFile.id_sequence = videoName;
          uploadFile.correspondingJson = correspondingJson.content;
          console.log('🔗 Found corresponding JSON for video:', videoName);
        } else {
          console.log('⚠️ No corresponding JSON found for video:', videoName);
        }
      }
      
      this.uploadedFiles.push(uploadFile);
    }
    
    this.uploadSuccess = true;
    this.uploadError = null;
  }

  private processIndividualJsonFile(file: File): Promise<void> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const jsonData = JSON.parse(content);
          
          // Add to processedJsonFiles
          this.processedJsonFiles.push({
            filename: file.name,
            content: content
          });
          
          console.log('📝 Processed individual JSON file:', file.name);
          resolve();
        } catch (error) {
          console.error('❌ Error processing JSON file:', file.name, error);
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }

  private getFileType(file: File): 'video' | 'json' {
    if (file.type.startsWith('video/') || file.name.match(/\.(mp4|avi|mov|wmv|flv)$/i)) {
      return 'video';
    } else if (file.type === 'application/json' || file.name.endsWith('.json')) {
      return 'json';
    }
    return 'video'; // Default to video
  }

  removeFile(index: number) {
    this.uploadedFiles.splice(index, 1);
  }

  // Queue-based Bulk Upload Processing
  processBulkUpload() {
    if (this.uploadedFiles.length === 0) {
      this.processingError = 'Aucun fichier sélectionné pour l\'upload en lot.';
      return;
    }

    // Reset queue state
    this.isQueueProcessing = true;
    this.isProcessing = true;
    this.processingError = null;
    this.processingSuccess = false;
    this.processingResult = null;
    this.queueProgress = 0;
    this.processedCount = 0;
    this.successCount = 0;
    this.errorCount = 0;
    this.currentProcessingIndex = -1;

    // Reset all file statuses to pending
    this.uploadedFiles.forEach(file => {
      file.status = 'pending';
      file.error = undefined;
      file.progress = 0;
    });

    // Start processing the queue
    this.processNextFile();
  }

  private processNextFile() {
    const pendingFiles = this.uploadedFiles.filter(file => file.status === 'pending');
    
    if (pendingFiles.length === 0) {
      // All files processed
      this.isQueueProcessing = false;
      this.isProcessing = false;
      this.processingSuccess = true;
      this.updateQueueProgress();
      return;
    }

    const nextFile = pendingFiles[0];
    const fileIndex = this.uploadedFiles.indexOf(nextFile);
    this.currentProcessingIndex = fileIndex;
    
    // Mark file as processing
    nextFile.status = 'processing';
    nextFile.progress = 0;
    
    // Simulate progress updates
    const progressInterval = setInterval(() => {
      if (nextFile.progress && nextFile.progress < 90) {
        nextFile.progress += Math.random() * 10;
      }
    }, 200);

    // Process this file
    this.processSingleFile(nextFile, fileIndex).then(() => {
      clearInterval(progressInterval);
      nextFile.progress = 100;
      this.processedCount++;
      this.updateQueueProgress();
      
      // Process next file after a short delay
      setTimeout(() => {
        this.processNextFile();
      }, 500);
    }).catch((error) => {
      clearInterval(progressInterval);
      nextFile.status = 'error';
      nextFile.error = error;
      nextFile.progress = 0;
      this.errorCount++;
      this.updateQueueProgress();
      
      // Continue with next file even if this one failed
      setTimeout(() => {
        this.processNextFile();
      }, 500);
    });
  }

  private async processSingleFile(uploadFile: UploadFile, fileIndex: number): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // Only process video files, skip JSON files
        if (uploadFile.type !== 'video') {
          console.log('⏭️ Skipping non-video file:', uploadFile.file.name);
          uploadFile.status = 'success';
          this.successCount++;
          resolve();
          return;
        }

        // Prepare annotation data for this file
        const annotation = uploadFile.correspondingJson ? JSON.parse(uploadFile.correspondingJson) : null;

        // Call the backend service for this single file
        this.bulkUploadService.uploadSingleFile(uploadFile.file, annotation).subscribe({
          next: (result) => {
            console.log('🔍 Single file upload result for file:', uploadFile.file.name, result);
            
            // Check if there are any errors in the result
            if (result.errors && result.errors.length > 0) {
              // If there are errors, treat this as a failure
              const errorMessages = result.errors.map(err => err.error).join(', ');
              console.log('❌ Errors found in result:', errorMessages);
              reject(errorMessages);
            } else if (result.videos && result.videos.length === 0) {
              // If no videos were uploaded, treat as failure
              console.log('❌ No videos uploaded');
              reject('Aucune vidéo n\'a été uploadée');
            } else {
              // Success - at least one video was uploaded
              console.log('✅ File processed successfully');
              uploadFile.status = 'success';
              this.successCount++;
              resolve();
            }
          },
          error: (error) => {
            console.log('❌ Error response for file:', uploadFile.file.name, error);
            let errorMessage = 'Erreur inconnue';
            
            if (error.status === 401) {
              errorMessage = 'Session expirée. Veuillez vous reconnecter.';
            } else if (error.status === 400) {
              // Handle 400 errors (like duplicate filename)
              if (error.error?.message) {
                errorMessage = error.error.message;
              } else if (error.error?.data?.errors && error.error.data.errors.length > 0) {
                // Handle errors from bulk upload response
                errorMessage = error.error.data.errors.map((err: any) => err.error).join(', ');
              } else {
                errorMessage = 'Erreur de validation du fichier.';
              }
            } else if (error.status === 0) {
              errorMessage = 'Impossible de se connecter au serveur.';
            } else {
              errorMessage = error.error?.message || 'Erreur lors de l\'upload du fichier.';
            }
            
            console.log('❌ Final error message:', errorMessage);
            reject(errorMessage);
          }
        });
      } catch (error) {
        reject('Erreur lors de la préparation du fichier: ' + error);
      }
    });
  }

  private updateQueueProgress() {
    const totalFiles = this.uploadedFiles.length;
    this.queueProgress = totalFiles > 0 ? (this.processedCount / totalFiles) * 100 : 0;
  }

  clearAll() {
    this.uploadedFiles = [];
    this.processedJsonFiles = [];
    this.selectedJsonFile = null;
    this.jsonFileName = null;
    this.uploadError = null;
    this.uploadSuccess = false;
    this.jsonProcessingError = null;
    this.jsonProcessingSuccess = false;
    this.processingResult = null;
    
    // Reset queue state
    this.isQueueProcessing = false;
    this.queueProgress = 0;
    this.processedCount = 0;
    this.successCount = 0;
    this.errorCount = 0;
    this.currentProcessingIndex = -1;
  }
} 