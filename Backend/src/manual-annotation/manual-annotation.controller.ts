/* eslint-disable prettier/prettier */
import { Body, Controller, Delete, Get, Param, Patch, Post, NotFoundException, UseGuards } from '@nestjs/common';
import { ManualAnnotationService } from './manual-annotation.service';
import { ManualAnnotationDto } from './dto/manual-annotation.dto';
import { UpdateManualAnnotationDto } from './dto/update-manual-annotation.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('manual-annotation')
@UseGuards(JwtAuthGuard)
export class ManualAnnotationController {
  constructor(private readonly manualAnnotationService: ManualAnnotationService) {}

  @Get('getAllAnnotation')
  async getAnnotations() {
    const annotations = await this.manualAnnotationService.getAnnotation();     
    if (!annotations) {
    return { status: 'success', message: 'No annotation found', data: [] };
  }
    return { status: 'success', data: annotations };
  }

  @Post('createAnnotation')
  async createAnnotation(@Body() annotation: ManualAnnotationDto) {
    const createdAnnotation = await this.manualAnnotationService.createAnnotation(annotation);
    return { status: 'success', data: createdAnnotation };
  }

  @Get('getAnnotationById/:id_sequence')
  async getAnnotationById(@Param('id_sequence') id_sequence: string) {
    const annotation = await this.manualAnnotationService.getAnnotationById(id_sequence);
    if (!annotation) {
      throw new NotFoundException(`Annotation with id_sequence '${id_sequence}' not found`);
    }
    return annotation;
  }

  @Delete('deleteAnnotation/:id_sequence')
  async deleteAnnotation(@Param('id_sequence') id_sequence: string) {
    const deleted = await this.manualAnnotationService.deleteAnnotation(id_sequence);
    if (!deleted) {
      throw new NotFoundException('Annotation not found');
    }
    return { status: 'success', data: 'deleted' };
  }

  @Patch('updateAnnotation/:id_sequence')
  async updateAnnotation(
    @Param('id_sequence') id_sequence: string,
    @Body() annotation: UpdateManualAnnotationDto,
  ) {
    const updatedAnnotation = await this.manualAnnotationService.updateAnnotation(id_sequence, annotation);
    if (!updatedAnnotation) {
      throw new NotFoundException('Annotation not found');
    }
    return { status: 'success', data: updatedAnnotation };
  }
}
