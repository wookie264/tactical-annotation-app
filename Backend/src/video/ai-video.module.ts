/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { AIVideoController } from './ai-video.controller';
import { AIVideoService } from './ai-video.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [AIVideoController],
  providers: [AIVideoService, PrismaService],
  exports: [AIVideoService],
})
export class AIVideoModule {} 