/* eslint-disable prettier/prettier */
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { VideoService } from './video.service';
import { CreateVideoDto, UpdateVideoDto } from './dto/video.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('video')
@UseGuards(JwtAuthGuard)
export class VideoController {
  constructor(private readonly videoService: VideoService) {}

  @Get('getAllVideos')
  async getAllVideos() {
    const videos = await this.videoService.getAllVideos();
    if (!videos || videos.length === 0) {
      return { status: 'success', message: 'No videos found', data: [] };
    }
    return { status: 'success', data: videos };
  }

  @Get('getVideoById/:id')
  async getVideoById(@Param('id') id: string) {
    const video = await this.videoService.getVideoById(id);
    return { status: 'success', data: video };
  }

  @Post('createVideo')
  async createVideo(@Body() createVideoDto: CreateVideoDto) {
    const video = await this.videoService.createVideo(createVideoDto);
    return { status: 'success', data: video };
  }

  @Post('uploadVideo')
  @UseInterceptors(FileInterceptor('video'))
  async uploadVideo(@UploadedFile() file: any) {
    if (!file) {
      throw new BadRequestException('No video file uploaded');
    }
    
    const video = await this.videoService.uploadVideo(file as { mimetype: string; size: number; originalname: string; buffer: Buffer });
    return { status: 'success', data: video };
  }

  @Put('updateVideo/:id')
  async updateVideo(@Param('id') id: string, @Body() updateVideoDto: UpdateVideoDto) {
    const video = await this.videoService.updateVideo(id, updateVideoDto);
    return { status: 'success', data: video };
  }

  @Delete('deleteVideo/:id')
  async deleteVideo(@Param('id') id: string) {
    await this.videoService.deleteVideo(id);
    return { status: 'success', data: 'Video deleted successfully' };
  }
}
