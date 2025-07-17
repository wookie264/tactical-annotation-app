import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {CreateRapportAnalyseDto } from 'src/rapport-analyse/Dto/rapport.dto';
@Injectable()
export class RapportAnalyseService {




constructor(private prisma: PrismaService) {}

  create(dto: CreateRapportAnalyseDto) {
    return this.prisma.rapportAnalyse.create({ data: dto });
  }

  findAll() {
    return this.prisma.rapportAnalyse.findMany({
      include: {
        video: true,
        annotation: true,
      },
    });
  }

  findOne(id: string) {
    return this.prisma.rapportAnalyse.findUnique({
      where: { id },
      include: {
        video: true,
        annotation: true,
      },
    });
  }

  update(id: string, dto: CreateRapportAnalyseDto) {
    return this.prisma.rapportAnalyse.update({
      where: { id },
      data: dto,
    });
  }

  remove(id: string) {
    return this.prisma.rapportAnalyse.delete({ where: { id } });
  }



}
