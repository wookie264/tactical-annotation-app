/* eslint-disable prettier/prettier */
import { Body, Controller, Delete, Get, Param,  Post, NotFoundException } from '@nestjs/common';
import { RapportService } from './rapport.service';
import { RapportDto } from './dto/rapport.dto';

@Controller('annotation')
export class RapportController {
  constructor(private readonly rapportService: RapportService) {}

  @Get()
  async getAnnotations() {
    const rapports = await this.rapportService.getRapport();     
    if (!rapports) {
    return { status: 'success', message: 'No annotation found', data: [] };
  }
    return { status: 'success', data: rapports };
  }

  @Post()
  async createAnnotation(@Body() rapport: RapportDto) {
    const createdRapport = await this.rapportService.createRapport(rapport);
    return { status: 'success', data: createdRapport };
  }

  @Get(':id_sequence')
  async getRapportById(@Param('id_sequence') id_sequence: string) {
    const rapport = await this.rapportService.getRapportById(id_sequence);
    if (!rapport) {
      throw new NotFoundException('Rapport not found');
    }
    return rapport;
  }

  @Delete(':id_sequence')
  async deleteRapport(@Param('id_sequence') id_sequence: string) {
    const deleted = await this.rapportService.deleteRapport(id_sequence);
    if (!deleted) {
      throw new NotFoundException('Annotation not found');
    }
    return { status: 'success', data: 'deleted' };
  }

}
