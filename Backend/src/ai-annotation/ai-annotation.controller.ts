/* eslint-disable prettier/prettier */
import { Controller, Post, Get, Body, Param, UseGuards } from '@nestjs/common';
import { AIAnnotationService, AIAnnotationRequest } from './ai-annotation.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('ai-annotation')
@UseGuards(JwtAuthGuard)
export class AIAnnotationController {
  constructor(private aiAnnotationService: AIAnnotationService) {}

  @Post('process')
  async processAIAnnotation(@Body() request: AIAnnotationRequest) {
    return await this.aiAnnotationService.processAIAnnotation(request);
  }

  @Get('video/:videoId')
  async getAIAnnotationsByVideo(@Param('videoId') videoId: string) {
    return await this.aiAnnotationService.getAIAnnotationsByVideo(videoId);
  }

  @Post('rapport/:rapportId/validate')
  async updateRapportValidation(
    @Param('rapportId') rapportId: string,
    @Body() body: { validation: string }
  ) {
    return await this.aiAnnotationService.updateRapportValidation(rapportId, body.validation);
  }

  @Post('analyze-annotation/:annotationId')
  async analyzeExistingAnnotation(@Param('annotationId') annotationId: string) {
    return await this.aiAnnotationService.analyzeExistingAnnotation(annotationId);
  }
} 