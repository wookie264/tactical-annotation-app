import { Component, EventEmitter, Output, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AIVideoService, Video } from '../services/ai-video.service';
import { AuthService, User } from '../services/auth.service';
import { AIAnnotationService } from '../services/ai-annotation.service';
import { Router } from '@angular/router';



@Component({
  selector: 'app-video',
  imports: [CommonModule],
  templateUrl: './video.html',
  styleUrl: './video.css'
})
export class VideoComponent implements OnDestroy {
  currentUser: User | null = null;
  selectedFile: File | null = null;
  fileName: string | null = null;
  videoPreviewUrl: string | null = null;
  isUploading = false;
  uploadError: string | null = null;
  uploadSuccess = false;
  uploadedVideo: Video | null = null;

  @Output() videoUploaded = new EventEmitter<Video>();


  
  constructor(
    private aiVideoService: AIVideoService,
    private router: Router,
    private authService: AuthService,
    private aiAnnotationService: AIAnnotationService
  ) {this.currentUser = this.authService.getCurrentUser();}

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.selectedFile = file;
      this.fileName = file.name;
      this.uploadError = null;
      this.uploadSuccess = false;
      this.uploadedVideo = null;
      
      // Check if video with this filename already exists
      this.checkForDuplicate(file.name);
      
      // Create preview URL for the video
      this.videoPreviewUrl = URL.createObjectURL(file);
    } else {
      this.clearSelection();
    }
  }

  private checkForDuplicate(filename: string) {
    this.aiVideoService.getAllVideos().subscribe({
      next: (response) => {
        const videos = response.data || [];
        const existingVideo = videos.find((video: any) => video.filename === filename);
        
        if (existingVideo) {
          this.uploadError = `⚠️ Une vidéo avec le nom '${filename}' existe déjà. Veuillez utiliser un nom différent ou supprimer la vidéo existante.`;
        }
      },
      error: (error) => {
        // Could not check for duplicates
        // Don't block upload if duplicate check fails
      }
    });
  }

  uploadVideo() {
    if (!this.selectedFile) {
      this.uploadError = 'Aucun fichier sélectionné';
      return;
    }

    this.isUploading = true;
    this.uploadError = null;
    this.uploadSuccess = false;

          // Uploading file

    this.aiVideoService.uploadVideo(this.selectedFile).subscribe({
      next: (response) => {
        this.isUploading = false;
        this.uploadSuccess = true;
        this.uploadedVideo = response.data;
        this.videoUploaded.emit(response.data);
        // Video uploaded successfully
      },
      error: (error) => {
        this.isUploading = false;
                  // Upload error details
        
        if (error.status === 401) {
          this.uploadError = 'Non autorisé. Veuillez vous reconnecter.';
        } else if (error.status === 400) {
          // Check for duplicate filename error
          const errorMessage = error.error?.message || '';
          if (errorMessage.includes('already exists')) {
            this.uploadError = `❌ ${errorMessage}`;
          } else {
            this.uploadError = errorMessage || 'Erreur de validation du fichier';
          }
        } else if (error.status === 0) {
          this.uploadError = 'Impossible de se connecter au serveur. Vérifiez que le backend est démarré.';
        } else {
          this.uploadError = error.error?.message || 'Échec de l\'upload de la vidéo';
        }
        
        // Upload error
      }
    });
  }

  cancelUpload() {
    this.clearSelection();
  }

  private clearSelection() {
    this.selectedFile = null;
    this.fileName = null;
    this.uploadError = null;
    this.uploadSuccess = false;
    this.uploadedVideo = null;
    
    // Clean up the preview URL to prevent memory leaks
    if (this.videoPreviewUrl) {
      URL.revokeObjectURL(this.videoPreviewUrl);
      this.videoPreviewUrl = null;
    }
  }

  // Get the id_sequence from the uploaded video filename
  getIdSequence(): string | null {
    if (this.uploadedVideo?.filename) {
      return this.aiVideoService.generateIdSequence(this.uploadedVideo.filename);
    }
    return null;
  }

  // Clean up when component is destroyed
  ngOnDestroy() {
    if (this.videoPreviewUrl) {
      URL.revokeObjectURL(this.videoPreviewUrl);
    }
  }

  // Check if upload should be disabled
  isUploadDisabled(): boolean {
    return !this.selectedFile || this.isUploading || !!this.uploadError;
  }

  logout() {
  this.authService.logout();
  this.router.navigate(['/login']);
}
  goBack() {
    this.router.navigate(['/userhome']);
  }

  triggerPrediction() {
    if (!this.uploadedVideo) {
      alert('Veuillez d\'abord uploader une vidéo');
      return;
    }

    if (confirm('Voulez-vous analyser cette vidéo avec l\'IA ? Cela créera un rapport d\'analyse IA.')) {
      // Create AI analysis request for the uploaded video (no manual annotation)
      const request = {
        videoId: this.uploadedVideo.id,
        videoPath: this.uploadedVideo.path || this.uploadedVideo.filename || ''
        // No annotationId - this is direct AI analysis on video
      };

      this.aiAnnotationService.processAIAnnotation(request).subscribe({
        next: (response) => {
          alert('Analyse IA terminée avec succès ! Un rapport d\'analyse a été créé.');
          // Navigate to the rapport page to see the results
          this.router.navigate(['/rapport']);
        },
        error: (error) => {
          console.error('AI analysis error:', error);
          alert('Erreur lors de l\'analyse IA. Veuillez réessayer.');
        }
      });
    }
  }
}

