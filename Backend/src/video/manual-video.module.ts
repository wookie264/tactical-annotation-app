/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { ManualVideoController } from './manual-video.controller';
import { ManualVideoService } from './manual-video.service';
import { PrismaService } from '../prisma/prisma.service';
import { ManualAnnotationService } from '../manual-annotation/manual-annotation.service';

@Module({
  controllers: [ManualVideoController],
  providers: [ManualVideoService, PrismaService, ManualAnnotationService],
  exports: [ManualVideoService],
})
export class ManualVideoModule {} 