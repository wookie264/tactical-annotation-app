/* eslint-disable prettier/prettier */
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVideoDto, UpdateVideoDto } from './dto/video.dto';
import { Prisma } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import * as ffmpeg from 'fluent-ffmpeg';

@Injectable()
export class VideoService {
  constructor(private prisma: PrismaService) {}

  private getVideoDuration(filePath: string): Promise<number> {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(filePath, (err, metadata) => {
        if (err) {
          reject(new Error('Failed to get video duration'));
        } else {
          const duration = (metadata as { format?: { duration?: number } })?.format?.duration;
          resolve(duration || 0);
        }
      });
    });
  }

  async getAllVideos() {
    return await this.prisma.video.findMany({
      include: {
        annotations: true,
      },
    });
  }

  async getVideoById(id: string) {
    const video = await this.prisma.video.findUnique({
      where: { id },
      include: {
        annotations: true,
      },
    });
    
    if (!video) {
      throw new NotFoundException(`Video with id '${id}' not found`);
    }
    
    return video;
  }

  async createVideo(createVideoDto: CreateVideoDto) {
    try {
      return await this.prisma.video.create({
        data: createVideoDto,
        include: {
          annotations: true,
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new BadRequestException(`Video with path '${createVideoDto.path}' already exists`);
        }
      }
      throw new BadRequestException('Failed to create video');
    }
  }

  async updateVideo(id: string, updateVideoDto: UpdateVideoDto) {
    try {
      return await this.prisma.video.update({
        where: { id },
        data: updateVideoDto,
        include: {
          annotations: true,
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`Video with id '${id}' not found`);
        }
      }
      throw new BadRequestException('Failed to update video');
    }
  }

  async deleteVideo(id: string) {
    try {
      const video = await this.prisma.video.delete({
        where: { id },
      });
      
      // Try to delete the actual file if it exists
      if (video.path && fs.existsSync(video.path)) {
        fs.unlinkSync(video.path);
      }
      
      return video;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`Video with id '${id}' not found`);
        }
      }
      throw new BadRequestException('Failed to delete video');
    }
  }

  async uploadVideo(file: { mimetype: string; size: number; originalname: string; buffer: Buffer }) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    // Validate file type
    const allowedMimeTypes = ['video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/flv'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('Invalid file type. Only video files are allowed.');
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const filename = `${timestamp}_${file.originalname}`;
    const filePath = path.join(uploadsDir, filename);

    // Save file to disk
    fs.writeFileSync(filePath, file.buffer);

    // Validate video duration (max 7 seconds)
    try {
      const duration = await this.getVideoDuration(filePath);
      if (duration > 7) {
        // Delete the uploaded file if duration is too long
        fs.unlinkSync(filePath);
        throw new BadRequestException(`Video too long. Duration: ${duration.toFixed(2)}s. Maximum duration is 7 seconds.`);
      }
    } catch (error) {
      // Delete the uploaded file if duration check fails
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to validate video duration. Please try again.');
    }

    // Save video info to database
    const videoData = {
      path: filePath,
      filename: file.originalname,
    };

    return await this.createVideo(videoData);
  }
}
