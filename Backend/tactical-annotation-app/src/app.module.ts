import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AnnotationModule } from './annotation/annotation.module';
import { VideoModule } from './video/video.module';
import { RapportAnalyseModule } from './rapport-analyse/rapport-analyse.module';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './user/user.module';
import { AdminModule } from './admin/admin.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [AnnotationModule, VideoModule, RapportAnalyseModule, PrismaModule, UserModule, AdminModule, AuthModule, ConfigModule.forRoot({
      isGlobal: true,  }), ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
