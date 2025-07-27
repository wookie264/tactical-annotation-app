/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { ManualAnnotationController } from './manual-annotation.controller';
import { ManualAnnotationService } from './manual-annotation.service';

@Module({
  controllers: [ManualAnnotationController],
  providers: [ManualAnnotationService],
  exports: [ManualAnnotationService],
})
export class ManualAnnotationModule {}
