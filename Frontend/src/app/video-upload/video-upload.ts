import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-video-upload',
  imports: [CommonModule],
  templateUrl: './video-upload.html',
  styleUrl: './video-upload.css'
})
export class VideoUpload {
  fileName: string | null = null;

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.fileName = input.files[0].name;
    } else {
      this.fileName = null;
    }
  }
}
