/* eslint-disable prettier/prettier */
import { Controller, Get, Post, Body, Param, Put, Delete, UseInterceptors, UploadedFile, BadRequestException, Logger } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AIVideoService } from './ai-video.service';
import { CreateVideoDto, UpdateVideoDto } from './dto/video.dto';

interface UploadedFileType {
  originalname: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

@Controller('ai-video')
export class AIVideoController {
  private readonly logger = new Logger(AIVideoController.name);
  
  constructor(private readonly aiVideoService: AIVideoService) {}

  @Get('getAllVideos')
  async getAllVideos() {
    const videos = await this.aiVideoService.getAllVideos();
    if (!videos || videos.length === 0) {
      return { status: 'success', message: 'No videos found', data: [] };
    }
    return { status: 'success', data: videos };
  }

  @Get('getVideoById/:id')
  async getVideoById(@Param('id') id: string) {
    const video = await this.aiVideoService.getVideoById(id);
    return { status: 'success', data: video };
  }

  @Post('createVideo')
  async createVideo(@Body() createVideoDto: CreateVideoDto) {
    const video = await this.aiVideoService.createVideo(createVideoDto);
    return { status: 'success', data: video };
  }

  @Post('uploadVideo')
  @UseInterceptors(FileInterceptor('video'))
  async uploadVideo(@UploadedFile() file: UploadedFileType) {
    this.logger.log('AI video upload request received');
    this.logger.log('File:', file ? {
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size
    } : 'No file');
    
    if (!file) {
      throw new BadRequestException('No video file uploaded');
    }
    
    try {
      const video = await this.aiVideoService.uploadVideo(file);
      this.logger.log('AI video uploaded successfully:', video.id);
      return { status: 'success', data: video };
    } catch (error) {
      this.logger.error('AI video upload failed:', error instanceof Error ? error.message : 'Unknown error');
      throw error;
    }
  }

  @Put('updateVideo/:id')
  async updateVideo(@Param('id') id: string, @Body() updateVideoDto: UpdateVideoDto) {
    const video = await this.aiVideoService.updateVideo(id, updateVideoDto);
    return { status: 'success', data: video };
  }

  @Delete('deleteVideo/:id')
  async deleteVideo(@Param('id') id: string) {
    await this.aiVideoService.deleteVideo(id);
    return { status: 'success', data: 'Video deleted successfully' };
  }
} 