import { Component, OnInit } from '@angular/core';
import { DatePipe, CommonModule } from '@angular/common';
import { AuthService, User } from '../services/auth.service';
import { AnnotationService } from '../services/annotation.service';
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
    private annotationService: AnnotationService,
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
    
    this.annotationService.getAllAnnotations().subscribe({
      next: (response) => {
        if (response.status === 'success' && response.data) {
          this.annotations = response.data;
          this.filteredAnnotations = this.annotations;
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
    return 'assets/mock-videos/' + ann.videoFile;
  }

  deleteAnnotation(id_sequence: string) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette annotation ? Cette action supprimera également la vidéo associée et ne peut pas être annulée.')) {
      this.annotationService.deleteAnnotation(id_sequence).subscribe({
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
