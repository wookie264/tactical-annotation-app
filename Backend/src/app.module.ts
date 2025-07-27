/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ManualAnnotationModule } from './manual-annotation/manual-annotation.module';
import { ManualVideoModule } from './video/manual-video.module';
import { AIVideoModule } from './video/ai-video.module';
import { PrismaService } from './prisma/prisma.service';
import { PrismaModule } from './prisma/prisma.module';
import { RapportModule } from './rapport/rapport.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { AIAnnotationModule } from './ai-annotation/ai-annotation.module';
import { EmailModule } from './email/email.module';

@Module({
    imports: [
    HttpModule,
    ManualAnnotationModule,
    PrismaModule,
    ManualVideoModule,
    AIVideoModule,
    RapportModule,
    AuthModule,
    UserModule,
    AIAnnotationModule,
    EmailModule
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}

