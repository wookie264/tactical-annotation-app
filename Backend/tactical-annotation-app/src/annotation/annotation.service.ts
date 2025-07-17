import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateAnnotationDto } from 'src/annotation/Dto/annotation.dto';

@Injectable()
export class AnnotationService {
    constructor(private prisma: PrismaService) {}

  async create(createAnnotationDto: CreateAnnotationDto) {
  return this.prisma.annotation.create({
    data: {
      ...createAnnotationDto,
      date_annotation: new Date(), // set current date here
    },
  });
}


  async findAll() {
    return this.prisma.annotation.findMany();
  }

  async findOne(id: string) {
    const annotation = await this.prisma.annotation.findUnique({
      where: { id },
    });
    if (!annotation) throw new NotFoundException(`Annotation with id ${id} not found`);
    return annotation;
  }

  async update(id: string, updateAnnotationDto: CreateAnnotationDto) {
    await this.findOne(id); // to check if exists
    return this.prisma.annotation.update({
      where: { id },
      data: updateAnnotationDto,
    });
  }

  async remove(id: string) {
    await this.findOne(id); // to check if exists
    return this.prisma.annotation.delete({
      where: { id },
    });
  }}
