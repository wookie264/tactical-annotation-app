/* eslint-disable prettier/prettier */
import { Controller, Get, Post, Body, Param, Put, Delete, UseInterceptors, UploadedFile, UploadedFiles, BadRequestException, Logger } from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ManualVideoService } from './manual-video.service';
import { CreateVideoDto, UpdateVideoDto } from './dto/video.dto';

interface UploadedFileType {
  originalname: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

@Controller('manual-video')
export class ManualVideoController {
  private readonly logger = new Logger(ManualVideoController.name);
  
  constructor(private readonly manualVideoService: ManualVideoService) {}

  @Get('getAllVideos')
  async getAllVideos() {
    const videos = await this.manualVideoService.getAllVideos();
    if (!videos || videos.length === 0) {
      return { status: 'success', message: 'No videos found', data: [] };
    }
    return { status: 'success', data: videos };
  }

  @Get('getVideoById/:id')
  async getVideoById(@Param('id') id: string) {
    const video = await this.manualVideoService.getVideoById(id);
    return { status: 'success', data: video };
  }

  @Post('createVideo')
  async createVideo(@Body() createVideoDto: CreateVideoDto) {
    const video = await this.manualVideoService.createVideo(createVideoDto);
    return { status: 'success', data: video };
  }

  @Post('uploadVideo')
  @UseInterceptors(FileInterceptor('video'))
  async uploadVideo(@UploadedFile() file: UploadedFileType) {
    this.logger.log('Manual video upload request received');
    this.logger.log('File:', file ? {
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size
    } : 'No file');
    
    if (!file) {
      throw new BadRequestException('No video file uploaded');
    }
    
    try {
      const video = await this.manualVideoService.uploadVideo(file);
      this.logger.log('Manual video uploaded successfully:', video.id);
      return { status: 'success', data: video };
    } catch (error) {
      this.logger.error('Manual video upload failed:', error instanceof Error ? error.message : 'Unknown error');
      throw error;
    }
  }

  @Post('bulkUpload')
  @UseInterceptors(FilesInterceptor('files'))
  async bulkUpload(@UploadedFiles() files: UploadedFileType[], @Body() body: { annotations?: string }) {
    this.logger.log('Manual video bulk upload request received');
    this.logger.log('Files count:', files?.length || 0);
    this.logger.log('Request body:', body);
    
    if (!files || files.length === 0) {
      throw new BadRequestException('No files uploaded');
    }

    // Parse annotations from the request body
    let annotations: any[] = [];
    if (body.annotations) {
      try {
        this.logger.log('Parsing manual annotations from body:', body.annotations);
        annotations = JSON.parse(body.annotations) as any[];
        this.logger.log('Parsed manual annotations:', annotations);
      } catch (error) {
        this.logger.error('Failed to parse manual annotations:', error);
        throw new BadRequestException('Invalid annotations format');
      }
    } else {
      this.logger.log('No manual annotations found in request body');
    }

    try {
      const result = await this.manualVideoService.bulkUpload(files, annotations);
      this.logger.log('Manual video bulk upload completed successfully');
      return { status: 'success', data: result };
    } catch (error) {
      this.logger.error('Manual video bulk upload failed:', error instanceof Error ? error.message : 'Unknown error');
      throw error;
    }
  }

  @Post('uploadSingleFile')
  @UseInterceptors(FileInterceptor('file'))
  async uploadSingleFile(@UploadedFile() file: UploadedFileType, @Body() body: { annotation?: string }) {
    this.logger.log('Single file upload request received');
    this.logger.log('File:', file ? file.originalname : 'No file');
    this.logger.log('Request body:', body);
    
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    // Parse annotation from the request body
    let annotation: any = null;
    if (body.annotation) {
      try {
        this.logger.log('Parsing annotation from body:', body.annotation);
        annotation = JSON.parse(body.annotation) as any;
        this.logger.log('Parsed annotation:', annotation);
      } catch (error) {
        this.logger.error('Failed to parse annotation:', error);
        throw new BadRequestException('Invalid annotation format');
      }
    } else {
      this.logger.log('No annotation found in request body');
    }

    try {
      const result = await this.manualVideoService.uploadSingleFileWithAnnotation(file, annotation);
      this.logger.log('Single file upload completed successfully');
      return { status: 'success', data: result };
    } catch (error) {
      this.logger.error('Single file upload failed:', error instanceof Error ? error.message : 'Unknown error');
      throw error;
    }
  }

  @Put('updateVideo/:id')
  async updateVideo(@Param('id') id: string, @Body() updateVideoDto: UpdateVideoDto) {
    const video = await this.manualVideoService.updateVideo(id, updateVideoDto);
    return { status: 'success', data: video };
  }

  @Delete('deleteVideo/:id')
  async deleteVideo(@Param('id') id: string) {
    await this.manualVideoService.deleteVideo(id);
    return { status: 'success', data: 'Video deleted successfully' };
  }
} 