import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AnnotationService } from './annotation.service';
import { CreateAnnotationDto } from 'src/annotation/Dto/annotation.dto';

@Controller('annotation')
export class AnnotationController {
  constructor(private readonly annotationService: AnnotationService) {}
@Post('addAnnotation')
  create(@Body() createAnnotationDto: CreateAnnotationDto) {
    return this.annotationService.create(createAnnotationDto);
  }

  @Get('displayAll')
  findAll() {
    return this.annotationService.findAll();
  }

  @Get('display/:id')
  findOne(@Param('id') id: string) {
    return this.annotationService.findOne(id);
  }

  @Patch('update/:id')
  update(@Param('id') id: string, @Body() updateAnnotationDto: CreateAnnotationDto) {
    return this.annotationService.update(id, updateAnnotationDto);
  }

  @Delete('delete/:id')
  remove(@Param('id') id: string) {
    return this.annotationService.remove(id);
  }



}
