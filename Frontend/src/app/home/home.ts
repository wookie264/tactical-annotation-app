import { Component } from '@angular/core';
import { VideoUpload } from '../video-upload/video-upload';
import { TacticalAnnotationForm } from '../tactical-annotation-form/tactical-annotation-form';
import { Video } from '../services/video.service';
import { AuthService, User } from '../services/auth.service';

@Component({
  selector: 'app-home',
  imports: [VideoUpload, TacticalAnnotationForm],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home {
  protected readonly title = 'Analyse Tactique Football';
  uploadedVideo: Video | null = null;
  currentUser: User | null = null;

  constructor(private authService: AuthService) {
    this.currentUser = this.authService.getCurrentUser();
  }

  onVideoUploaded(video: Video) {
    this.uploadedVideo = video;
    console.log('Video uploaded in home component:', video);
  }

  onAnnotationCreated(annotation: any) {
    console.log('Annotation created in home component:', annotation);
    // You can add additional logic here, such as showing a success message
    // or redirecting to another page
  }

  logout() {
    this.authService.logout();
  }
} 