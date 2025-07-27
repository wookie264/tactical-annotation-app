/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AnnotationModule } from './annotation/annotation.module';
import { VideoModule } from './video/video.module';
import { PrismaService } from './prisma/prisma.service';
import { PrismaModule } from './prisma/prisma.module';
import { RapportModule } from './rapport/rapport.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { AIAnnotationModule } from './ai-annotation/ai-annotation.module';

@Module({
  imports: [
    HttpModule,
    AnnotationModule, 
    PrismaModule, 
    VideoModule, 
    RapportModule, 
    AuthModule,
    UserModule,
    AIAnnotationModule
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}

