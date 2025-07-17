import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { RapportAnalyseService } from './rapport-analyse.service';
import {CreateRapportAnalyseDto } from 'src/rapport-analyse/Dto/rapport.dto';

@Controller('rapport')
export class RapportAnalyseController {



  constructor(private readonly service: RapportAnalyseService) {}

  @Post('add')
  create(@Body() dto: CreateRapportAnalyseDto) {
    return this.service.create(dto);
  }

  @Get('displayAll')
  findAll() {
    return this.service.findAll();
  }

  @Get('display/:id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch('update/:id')
  update(@Param('id') id: string, @Body() dto: CreateRapportAnalyseDto) {
    return this.service.update(id, dto);
  }

  @Delete('delete/:id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
