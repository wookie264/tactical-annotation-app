import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AIAnnotationController } from './ai-annotation.controller';
import { AIAnnotationService } from './ai-annotation.service';
import { RapportModule } from '../rapport/rapport.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [HttpModule, RapportModule, PrismaModule],
  controllers: [AIAnnotationController],
  providers: [AIAnnotationService],
  exports: [AIAnnotationService]
})
export class AIAnnotationModule {} 