/* eslint-disable prettier/prettier */
import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RapportService } from '../rapport/rapport.service';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

export interface AIAnnotationRequest {
  videoId: string;
  annotationId?: string; // Optional - only if analyzing an existing manual annotation
  videoPath: string;
}

export interface AIAnalysisResponse {
  prediction_ia: string;
  confiance: number;
  joueurs_detectes: number[];
  commentaire_expert: string;
}

@Injectable()
export class AIAnnotationService {
  constructor(
    private prisma: PrismaService,
    private rapportService: RapportService,
    private httpService: HttpService
  ) {}

  async processAIAnnotation(request: AIAnnotationRequest) {
    try {
      // Call external AI API
      const aiResponse = await this.callExternalAI(request.videoPath);
      
      // Verify video exists
      const video = await this.prisma.video.findUnique({
        where: { id: request.videoId }
      });

      if (!video) {
        throw new BadRequestException('Video not found');
      }

      // Check if we're analyzing an existing manual annotation
      let annotationData: any = null;
      if (request.annotationId) {
        annotationData = await this.prisma.annotation.findUnique({
          where: { id: request.annotationId }
        });
        
        if (!annotationData) {
          throw new BadRequestException('Specified annotation not found');
        }
      }

      // Create rapport with AI analysis
      const rapportData = {
        id_sequence: `RAP_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        prediction_ia: aiResponse.prediction_ia,
        confiance: aiResponse.confiance,
        annotation_humaine: annotationData?.annotation || 'Analyse IA directe sur vidéo',
        equipe: annotationData?.domicile || 'Équipe analysée',
        joueurs_detectes: aiResponse.joueurs_detectes,
        commentaire_expert: aiResponse.commentaire_expert,
        validation: 'pending',
        annotationId: annotationData?.id || null // Link to annotation if exists
      };

      const rapport = await this.rapportService.createRapport(rapportData);

      return {
        success: true,
        rapport,
        aiAnalysis: aiResponse,
        linkedAnnotation: annotationData // Only if analyzing existing annotation
      };

    } catch (error: any) {
      throw new BadRequestException(`AI annotation failed: ${error?.message || 'Unknown error'}`);
    }
  }

  private async callExternalAI(videoPath: string): Promise<AIAnalysisResponse> {
    try {
      // Replace with your actual external AI API endpoint
      const externalApiUrl = process.env.EXTERNAL_AI_API_URL || 'https://api.example.com/analyze';
      
      console.log('Calling external AI API:', externalApiUrl);
      console.log('Request payload:', { video_path: videoPath, analysis_type: 'tactical_football' });
      
      const response = await firstValueFrom(
        this.httpService.post(externalApiUrl, {
          video_path: videoPath,
          analysis_type: 'tactical_football'
        }, {
          headers: {
            'Authorization': `Bearer ${process.env.EXTERNAL_AI_API_KEY}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000 // 30 seconds timeout
        })
      );

      console.log('AI API Response:', response.data);
      
      // The mock AI service wraps the response in a 'data' property
      const aiResponse = response.data.data || response.data;
      console.log('Extracted AI Response:', aiResponse);
      
      return aiResponse;
    } catch (error: any) {
      // Fallback mock response for development/testing
      console.warn('External AI API call failed, using mock response:', error?.message || 'Unknown error');
      
      return {
        prediction_ia: 'Formation 4-4-2 détectée avec pressing haut',
        confiance: 0.85,
        joueurs_detectes: [11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1],
        commentaire_expert: 'Analyse automatique: L\'équipe utilise une formation classique avec un pressing agressif. Les joueurs sont bien positionnés et coordonnés.'
      };
    }
  }

  async getAIAnnotationsByVideo(videoId: string) {
    return await this.prisma.rapportAnalyse.findMany({
      where: {
        annotation: {
          videoId: videoId
        }
      },
      include: {
        annotation: true
      }
    });
  }

  async updateRapportValidation(rapportId: string, validation: string) {
    return await this.rapportService.updateRapport(rapportId, { validation });
  }

  // Method to analyze an existing manual annotation with AI
  async analyzeExistingAnnotation(annotationId: string) {
    try {
      // Get the annotation and its associated video
      const annotation = await this.prisma.annotation.findUnique({
        where: { id: annotationId },
        include: { video: true }
      });

      if (!annotation) {
        throw new BadRequestException('Annotation not found');
      }

      // Call AI analysis on the video
      const aiResponse = await this.callExternalAI(annotation.video.path);

      // Create rapport linked to the existing annotation
      const rapportData = {
        id_sequence: `RAP_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        prediction_ia: aiResponse.prediction_ia,
        confiance: aiResponse.confiance,
        annotation_humaine: annotation.annotation,
        equipe: annotation.domicile || 'Unknown',
        joueurs_detectes: aiResponse.joueurs_detectes,
        commentaire_expert: aiResponse.commentaire_expert,
        validation: 'pending',
        annotationId: annotation.id
      };

      const rapport = await this.rapportService.createRapport(rapportData);

      return {
        success: true,
        rapport,
        aiAnalysis: aiResponse,
        linkedAnnotation: annotation
      };

    } catch (error: any) {
      throw new BadRequestException(`AI analysis of annotation failed: ${error?.message || 'Unknown error'}`);
    }
  }
} 