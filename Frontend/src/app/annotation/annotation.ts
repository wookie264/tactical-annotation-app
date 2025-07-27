import { Component, OnInit } from '@angular/core';
import { DatePipe, CommonModule } from '@angular/common';
import { AuthService, User } from '../services/auth.service';
import { ManualAnnotationService } from '../services/manual-annotation.service';
import { AIAnnotationService } from '../services/ai-annotation.service';

@Component({
  selector: 'app-annotation',
  imports: [CommonModule, DatePipe],
  templateUrl: './annotation.html',
  styleUrl: './annotation.css'
})
export class Annotation implements OnInit {
  annotations: any[] = [];
  filteredAnnotations: any[] = [];
  currentUser: User | null = null;
  hoveredVideo: any = null;
  isLoading = false;
  error: string | null = null;

  constructor(
    private authService: AuthService,
    private manualAnnotationService: ManualAnnotationService,
    private aiAnnotationService: AIAnnotationService
  ) {
    this.currentUser = this.authService.getCurrentUser();
  }

  ngOnInit() {
    this.loadAnnotations();
  }

  loadAnnotations() {
    this.isLoading = true;
    this.error = null;
    
    this.manualAnnotationService.getAllAnnotations().subscribe({
      next: (response) => {
        console.log('📊 Received annotations response:', response);
        if (response.status === 'success' && response.data) {
          // Filter out AI-created annotations (old ones created before architecture fix)
          this.annotations = response.data.filter((ann: any) => 
            ann.validateur !== 'Système IA' && 
            !ann.annotation?.includes('Analyse automatique IA')
          );
          this.filteredAnnotations = this.annotations;
          console.log('📝 Filtered annotations:', this.annotations);
        } else {
          this.annotations = [];
          this.filteredAnnotations = [];
        }
        this.isLoading = false;
      },
      error: (error) => {
        // Error loading annotations
        this.error = 'Erreur lors du chargement des annotations';
        this.isLoading = false;
        this.annotations = [];
        this.filteredAnnotations = [];
      }
    });
  }

  togglePlay(video: HTMLVideoElement) {
    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
  }

  getProgress(video: HTMLVideoElement): number {
    if (!video.duration) return 0;
    return (video.currentTime / video.duration) * 100;
  }

  getVideoUrl(ann: any): string {
    console.log('🎥 Video data for annotation:', ann.id_sequence, ann.video);
    
    // Use the video path from the backend if available, otherwise fallback to mock videos
    if (ann.video && ann.video.filename) {
      // Extract just the filename from the full path if needed
      let filename = ann.video.filename;
      if (filename.includes('/') || filename.includes('\\')) {
        filename = filename.split(/[/\\]/).pop() || filename;
      }
      
      // Map to available mock videos
      if (filename.toLowerCase().includes('video1') || filename.toLowerCase().includes('lfc')) {
        filename = 'video1.mp4';
      } else if (filename.toLowerCase().includes('video2') || filename.toLowerCase().includes('mnc')) {
        filename = 'video2.mp4';
      } else {
        // Default to video1 if we can't determine
        filename = 'video1.mp4';
      }
      
      const videoUrl = 'assets/mock-videos/' + filename;
      console.log('🎬 Generated video URL:', videoUrl);
      return videoUrl;
    }
    
    // Fallback to a default video
    console.log('🎬 Using fallback video URL');
    return 'assets/mock-videos/video1.mp4';
  }

  onVideoError(event: any, ann: any) {
    console.error('❌ Video error for annotation:', ann.id_sequence, event);
    console.error('❌ Video URL was:', this.getVideoUrl(ann));
  }

  onVideoLoaded(ann: any) {
    console.log('✅ Video loaded successfully for annotation:', ann.id_sequence);
  }

  deleteAnnotation(id_sequence: string) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette annotation ? Cette action supprimera également la vidéo associée et ne peut pas être annulée.')) {
      this.manualAnnotationService.deleteAnnotation(id_sequence).subscribe({
        next: (response) => {
          // Annotation deleted successfully
          // Reload annotations after deletion
          this.loadAnnotations();
        },
        error: (error) => {
          // Error deleting annotation
          alert('Erreur lors de la suppression de l\'annotation');
        }
      });
    }
  }

  triggerAIAnalysis(annotation: any) {
    if (confirm('Voulez-vous analyser cette annotation avec l\'IA ? Cela créera un rapport d\'analyse automatique.')) {
      const request = {
        videoId: annotation.videoId,
        annotationId: annotation.id,
        videoPath: annotation.video?.path || ''
      };

      this.aiAnnotationService.processAIAnnotation(request).subscribe({
        next: (response) => {
          // AI analysis completed
          alert('Analyse IA terminée avec succès !');
          // Reload annotations to show the new rapport
          this.loadAnnotations();
        },
        error: (error) => {
          // AI analysis error
          alert('Erreur lors de l\'analyse IA');
        }
      });
    }
  }
}
