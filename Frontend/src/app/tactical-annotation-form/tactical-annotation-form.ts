import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AnnotationService, CreateAnnotationDto } from '../services/annotation.service';
import { Video } from '../services/video.service';

@Component({
  selector: 'app-tactical-annotation-form',
  imports: [FormsModule, CommonModule],
  templateUrl: './tactical-annotation-form.html',
  styleUrl: './tactical-annotation-form.css'
})
export class TacticalAnnotationForm {
  @Input() uploadedVideo: Video | null = null;
  @Output() annotationCreated = new EventEmitter<any>();

  formData = {
    equipeDomicile: '',
    equipeVisiteuse: '',
    entraineur: '',
    annotationTactique: '',
    commentaire: ''
  };

  isSubmitting = false;
  submitError: string | null = null;
  submitSuccess = false;

  constructor(private annotationService: AnnotationService) {}

  onSubmit() {
    if (!this.uploadedVideo) {
      this.submitError = 'Veuillez d\'abord uploader une vidéo';
      return;
    }

    if (!this.formData.equipeDomicile || !this.formData.equipeVisiteuse || 
        !this.formData.entraineur || !this.formData.annotationTactique) {
      this.submitError = 'Veuillez remplir tous les champs obligatoires';
      return;
    }

    this.isSubmitting = true;
    this.submitError = null;
    this.submitSuccess = false;

    // Generate id_sequence from video filename (without extension)
    const idSequence = this.uploadedVideo.filename 
      ? this.uploadedVideo.filename.replace(/\.[^/.]+$/, '')
      : this.uploadedVideo.id;

    const annotationData: CreateAnnotationDto = {
      id_sequence: idSequence,
      annotation: this.formData.annotationTactique,
      validateur: this.formData.entraineur,
      commentaire: this.formData.commentaire,
      domicile: this.formData.equipeDomicile,
      visiteuse: this.formData.equipeVisiteuse,
      videoId: this.uploadedVideo.id
    };

    this.annotationService.createAnnotation(annotationData).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        this.submitSuccess = true;
        this.annotationCreated.emit(response.data);
        console.log('Annotation created successfully:', response.data);
        this.resetForm();
      },
      error: (error) => {
        this.isSubmitting = false;
        this.submitError = error.error?.message || 'Failed to create annotation';
        console.error('Annotation creation error:', error);
      }
    });
  }

  resetForm() {
    this.formData = {
      equipeDomicile: '',
      equipeVisiteuse: '',
      entraineur: '',
      annotationTactique: '',
      commentaire: ''
    };
  }

  // Check if form can be submitted
  canSubmit(): boolean {
    return !!this.uploadedVideo && 
           !!this.formData.equipeDomicile && 
           !!this.formData.equipeVisiteuse && 
           !!this.formData.entraineur && 
           !!this.formData.annotationTactique;
  }

  // Helper method to get the display filename
  getDisplayFilename(): string {
    return this.uploadedVideo?.filename || 'Vidéo uploadée';
  }

  // Helper method to get the id sequence display
  getIdSequenceDisplay(): string {
    if (!this.uploadedVideo) return '';
    return this.uploadedVideo.filename 
      ? this.uploadedVideo.filename.replace(/\.[^/.]+$/, '')
      : this.uploadedVideo.id;
  }
}
