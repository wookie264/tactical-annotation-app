import { Controller } from '@nestjs/common';
import {
   Get, Post, Body, Patch, Param, Delete, UploadedFile, UseInterceptors
} from '@nestjs/common';
import { VideoService } from './video.service';
import { CreateVideoDto } from 'src/video/Dto/video.dto';
//import { FileInterceptor } from '@nestjs/platform-express';
//import { diskStorage } from 'multer';
//import { extname } from 'path';
import * as fs from 'fs';
import * as path from 'path';
//import { Express } from 'express';
@Controller('video')
export class VideoController {
  constructor(private readonly videoService: VideoService) {}

 @Post('add')
async uploadByPath(@Body() body: { path: string }) {
  const sourcePath = body.path;

  if (!fs.existsSync(sourcePath)) {
    return { error: 'File does not exist at provided path.' };
  }

  const uploadDir = path.join(__dirname, '../../uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const fileExtension = path.extname(sourcePath);
  const uniqueFilename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${fileExtension}`;
  const destinationPath = path.join(uploadDir, uniqueFilename);

  try {
    fs.copyFileSync(sourcePath, destinationPath);

    // Save video record in DB using service (example)
    const relativePath = destinationPath.replace(process.cwd(), '').replace(/\\/g, '/'); // store relative path
    const createdVideo = await this.videoService.create({ path: relativePath });

    return { message: 'File copied and video saved successfully', video: createdVideo };
  } catch (err) {
    console.error(err);
    return { error: 'Error copying file or saving video' };
  }
}


 @Get('displayAll')
async findAll() {
  try {
    return await this.videoService.findAll();
  } catch (error) {
    console.error('Error fetching videos:', error);
    throw error;
  }
}

  @Get('displayOne/:id')
  findOne(@Param('id') id: string) {
    return this.videoService.findOne(id);
  }

  @Patch('update/:id')
  update(@Param('id') id: string, @Body() updateVideoDto: CreateVideoDto) {
    return this.videoService.update(id, updateVideoDto);
  }

  @Delete('delete/:id')
  remove(@Param('id') id: string) {
    return this.videoService.remove(id);
  }
}