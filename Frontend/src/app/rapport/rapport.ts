import { Component, OnInit } from '@angular/core';
import { AuthService, User } from '../services/auth.service';
import { DatePipe, CommonModule } from '@angular/common';
import { RapportService } from '../services/rapport.service';

@Component({
  selector: 'app-rapport',
  imports: [CommonModule, DatePipe],
  templateUrl: './rapport.html',
  styleUrl: './rapport.css'
})
export class Rapport implements OnInit {
  rapports: any[] = [];
  filteredRapports: any[] = [];
  currentUser: User | null = null;
  hoveredVideo: any = null;
  isLoading = false;
  error: string | null = null;

  constructor(
    private authService: AuthService,
    private rapportService: RapportService
  ) {
    this.currentUser = this.authService.getCurrentUser();
  }

  ngOnInit() {
    this.loadRapports();
  }

  loadRapports() {
    this.isLoading = true;
    this.error = null;
    
    this.rapportService.getAllRapports().subscribe({
      next: (response) => {
        if (response.status === 'success' && response.data) {
          this.rapports = response.data;
          this.filteredRapports = this.rapports;
        } else {
          this.rapports = [];
          this.filteredRapports = [];
        }
        this.isLoading = false;
      },
      error: (error) => {
        // Error loading rapports
        this.error = 'Erreur lors du chargement des rapports IA';
        this.isLoading = false;
        this.rapports = [];
        this.filteredRapports = [];
      }
    });
  }

  getVideoUrl(video: any): string {
    if (!video) return '';
    // If video has a path, use it directly, otherwise use mock video
    return video.path || 'assets/mock-videos/video1.mp4';
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

  deleteRapport(id_sequence: string) {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce rapport IA ? Cette action supprimera également l\'annotation et la vidéo associées et ne peut pas être annulée.')) {
      this.rapportService.deleteRapport(id_sequence).subscribe({
        next: (response) => {
          // Rapport deleted successfully
          // Reload rapports after deletion
          this.loadRapports();
        },
        error: (error) => {
          // Error deleting rapport
          alert('Erreur lors de la suppression du rapport');
        }
      });
    }
  }
}
