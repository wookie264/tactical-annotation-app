import { Component, signal } from '@angular/core';
import { VideoUpload } from './video-upload/video-upload';
import { TacticalAnnotationForm } from './tactical-annotation-form/tactical-annotation-form';

@Component({
  selector: 'app-root',
  imports: [VideoUpload, TacticalAnnotationForm],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('tactical-annotation-frontend');
}
