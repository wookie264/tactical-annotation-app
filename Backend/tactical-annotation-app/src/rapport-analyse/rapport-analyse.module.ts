import { Module } from '@nestjs/common';
import { RapportAnalyseService } from './rapport-analyse.service';
import { RapportAnalyseController } from './rapport-analyse.controller';

@Module({
  controllers: [RapportAnalyseController],
  providers: [RapportAnalyseService],
})
export class RapportAnalyseModule {}
