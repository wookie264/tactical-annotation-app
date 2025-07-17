import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AnnotationModule } from './annotation/annotation.module';
import { VideoModule } from './video/video.module';
import { RapportAnalyseModule } from './rapport-analyse/rapport-analyse.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [AnnotationModule, VideoModule, RapportAnalyseModule, PrismaModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
