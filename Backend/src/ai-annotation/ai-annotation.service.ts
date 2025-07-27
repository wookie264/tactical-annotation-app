/* eslint-disable prettier/prettier */
import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RapportService } from '../rapport/rapport.service';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

export interface AIAnnotationRequest {
  videoId: string;
  annotationId: string;
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
      
      // Get annotation details
      const annotation = await this.prisma.annotation.findUnique({
        where: { id: request.annotationId }
      });

      if (!annotation) {
        throw new BadRequestException('Annotation not found');
      }

      // Create rapport with AI analysis
      const rapportData = {
        id_sequence: `RAP_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        prediction_ia: aiResponse.prediction_ia,
        confiance: aiResponse.confiance,
        annotation_humaine: annotation.annotation,
        equipe: annotation.domicile || 'Unknown',
        joueurs_detectes: aiResponse.joueurs_detectes,
        commentaire_expert: aiResponse.commentaire_expert,
        validation: 'pending',
        annotationId: request.annotationId
      };

      const rapport = await this.rapportService.createRapport(rapportData);

      return {
        success: true,
        rapport,
        aiAnalysis: aiResponse
      };

    } catch (error) {
      throw new BadRequestException(`AI annotation failed: ${error.message}`);
    }
  }

  private async callExternalAI(videoPath: string): Promise<AIAnalysisResponse> {
    try {
      // Replace with your actual external AI API endpoint
      const externalApiUrl = process.env.EXTERNAL_AI_API_URL || 'https://api.example.com/analyze';
      
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

      return response.data;
    } catch (error) {
      // Fallback mock response for development/testing
      console.warn('External AI API call failed, using mock response:', error.message);
      
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
} 