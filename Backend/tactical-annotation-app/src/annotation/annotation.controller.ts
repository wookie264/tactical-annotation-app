/* eslint-disable prettier/prettier */
import { Body, Controller, Delete, Get, Param, Patch, Post, NotFoundException } from '@nestjs/common';
import { AnnotationService } from './annotation.service';
import { AnnotationDto } from './dto/annotation.dto';

@Controller('annotation')
export class AnnotationController {
  constructor(private readonly annotationService: AnnotationService) {}

  @Get()
  async getAnnotations() {
    const annotations = await this.annotationService.getAnnotation();     
    if (!annotations) {
    return { status: 'success', message: 'No annotation found', data: [] };
  }
    return { status: 'success', data: annotations };
  }

  @Post()
  async createAnnotation(@Body() annotation: AnnotationDto) {
    const createdAnnotation = await this.annotationService.createAnnotation(annotation);
    return { status: 'success', data: createdAnnotation };
  }

  @Get(':id_sequence')
  async getAnnotationById(@Param('id_sequence') id_sequence: string) {
    const annotation = await this.annotationService.getAnnotationById(id_sequence);
    if (!annotation) {
      throw new NotFoundException('Annotation not found');
    }
    return annotation;
  }

  @Delete(':id_sequence')
  async deleteAnnotation(@Param('id_sequence') id_sequence: string) {
    const deleted = await this.annotationService.deleteAnnotation(id_sequence);
    if (!deleted) {
      throw new NotFoundException('Annotation not found');
    }
    return { status: 'success', data: 'deleted' };
  }

  @Patch(':id_sequence')
  async updateAnnotation(
    @Param('id_sequence') id_sequence: string,
    @Body() annotation: AnnotationDto,
  ) {
    const updatedAnnotation = await this.annotationService.updateAnnotation(id_sequence, annotation);
    if (!updatedAnnotation) {
      throw new NotFoundException('Annotation not found');
    }
    return { status: 'success', data: updatedAnnotation };
  }
}
