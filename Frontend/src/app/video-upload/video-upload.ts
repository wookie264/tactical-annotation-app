import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VideoService, Video } from '../services/video.service';

@Component({
  selector: 'app-video-upload',
  imports: [CommonModule],
  templateUrl: './video-upload.html',
  styleUrl: './video-upload.css'
})
export class VideoUpload {
  fileName: string | null = null;
  isUploading = false;
  uploadError: string | null = null;
  uploadSuccess = false;
  uploadedVideo: Video | null = null;

  @Output() videoUploaded = new EventEmitter<Video>();

  constructor(private videoService: VideoService) {}

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.fileName = file.name;
      this.uploadVideo(file);
    } else {
      this.fileName = null;
    }
  }

  uploadVideo(file: File) {
    this.isUploading = true;
    this.uploadError = null;
    this.uploadSuccess = false;

    console.log('Uploading file:', file.name, 'Size:', file.size, 'Type:', file.type);

    this.videoService.uploadVideo(file).subscribe({
      next: (response) => {
        this.isUploading = false;
        this.uploadSuccess = true;
        this.uploadedVideo = response.data;
        this.videoUploaded.emit(response.data);
        console.log('Video uploaded successfully:', response.data);
      },
      error: (error) => {
        this.isUploading = false;
        console.error('Upload error details:', error);
        
        if (error.status === 401) {
          this.uploadError = 'Non autorisé. Veuillez vous reconnecter.';
        } else if (error.status === 400) {
          this.uploadError = error.error?.message || 'Erreur de validation du fichier';
        } else if (error.status === 0) {
          this.uploadError = 'Impossible de se connecter au serveur. Vérifiez que le backend est démarré.';
        } else {
          this.uploadError = error.error?.message || 'Échec de l\'upload de la vidéo';
        }
        
        console.error('Upload error:', error);
      }
    });
  }

  // Get the id_sequence from the uploaded video filename
  getIdSequence(): string | null {
    if (this.uploadedVideo?.filename) {
      return this.videoService.generateIdSequence(this.uploadedVideo.filename);
    }
    return null;
  }
}
