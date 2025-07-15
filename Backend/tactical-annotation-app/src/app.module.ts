import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AnnotationModule } from './annotation/annotation.module';
import { VideoModule } from './video/video.module';

@Module({
  imports: [AnnotationModule, VideoModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
