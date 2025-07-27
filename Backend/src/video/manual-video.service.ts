/* eslint-disable prettier/prettier */
import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateVideoDto, UpdateVideoDto } from './dto/video.dto';
import { ManualAnnotationService } from '../manual-annotation/manual-annotation.service';
import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

@Injectable()
export class ManualVideoService {
  constructor(
    private prisma: PrismaService,
    private manualAnnotationService: ManualAnnotationService
  ) {}

  async getAllVideos() {
    return await this.prisma.video.findMany();
  }

  async getVideoById(id: string) {
    return await this.prisma.video.findUnique({
      where: { id },
    });
  }

  async createVideo(createVideoDto: CreateVideoDto) {
    return await this.prisma.video.create({
      data: createVideoDto,
    });
  }

  async updateVideo(id: string, updateVideoDto: UpdateVideoDto) {
    return await this.prisma.video.update({
      where: { id },
      data: updateVideoDto,
    });
  }

  async deleteVideo(id: string) {
    return await this.prisma.video.delete({
      where: { id },
    });
  }

  private async validateVideoDuration(filePath: string): Promise<void> {
    try {
      const { stdout } = await execAsync(`ffprobe -v quiet -show_entries format=duration -of csv=p=0 "${filePath}"`);
      const duration = parseFloat(stdout.trim());
      
      if (isNaN(duration) || duration <= 0) {
        throw new BadRequestException('Invalid video file or unable to determine duration');
      }
      
      if (duration > 300) { // 5 minutes limit
        throw new BadRequestException('Video duration exceeds 5 minutes limit');
      }
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to validate video file');
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

    // Check for duplicate filename
    const existingVideo = await this.prisma.video.findFirst({
      where: {
        filename: file.originalname
      }
    });

    if (existingVideo) {
      throw new BadRequestException(`A video with the filename '${file.originalname}' already exists. Please use a different filename or delete the existing video first.`);
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Generate filename using only the original name
    const filename = file.originalname;
    const filePath = path.join(uploadsDir, filename);

    // Save file to disk
    fs.writeFileSync(filePath, file.buffer);

    // Validate video duration
    await this.validateVideoDuration(filePath);

    // Save video info to database (only path field exists in schema)
    const videoData = {
      path: filePath,
      filename: file.originalname,
    };

    return await this.createVideo(videoData);
  }

  async bulkUpload(files: { mimetype: string; size: number; originalname: string; buffer: Buffer }[], annotations: any) {
    console.log('🔍 Manual Video Bulk upload started');
    console.log('📁 Files received:', files.length);
    console.log('📝 Annotations received:', annotations?.length || 0);
    
    const results: {
      videos: any[];
      annotations: any[];
      errors: Array<{ file?: string; annotation?: string; error: string }>;
    } = {
      videos: [],
      annotations: [],
      errors: []
    };

    // Separate videos and JSON files
    const videoFiles = files.filter(file => 
      file.mimetype.startsWith('video/') || 
      file.originalname.match(/\.(mp4|avi|mov|wmv|flv)$/i)
    );

    console.log('🎬 Video files found:', videoFiles.length);

    // Process videos first and store them with their filenames
    const uploadedVideos = new Map<string, any>();
    
    for (const videoFile of videoFiles) {
      try {
        console.log('📤 Uploading video:', videoFile.originalname);
        const video = await this.uploadVideo(videoFile);
        results.videos.push(video);
        
        // Store video by filename (without extension) for annotation matching
        const videoName = videoFile.originalname.replace(/\.[^/.]+$/, '');
        uploadedVideos.set(videoName, video);
        console.log('✅ Video uploaded successfully:', videoName, '->', video.id);
      } catch (error) {
        console.error('❌ Video upload failed:', videoFile.originalname, error);
        results.errors.push({
          file: videoFile.originalname,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    console.log('📊 Uploaded videos map:', Array.from(uploadedVideos.entries()));

    // Process annotations if provided
    if (annotations && Array.isArray(annotations)) {
      console.log('📝 Processing manual annotations...');
      for (const annotation of annotations) {
        try {
          console.log('🔍 Processing annotation:', annotation.id_sequence);
          
          // Find the corresponding video for this annotation
          const videoName = annotation.id_sequence;
          const correspondingVideo = uploadedVideos.get(videoName);
          
          if (!correspondingVideo) {
            console.error('❌ No video found for annotation:', videoName);
            results.errors.push({
              annotation: annotation.id_sequence || 'unknown',
              error: `No corresponding video found for annotation ${annotation.id_sequence}. The video may have failed to upload or doesn't exist.`
            });
            continue;
          }

          console.log('✅ Found corresponding video:', videoName, '->', correspondingVideo.id);

          // Filter out date_annotation since it's handled automatically by Prisma
          const { date_annotation, ...annotationWithoutDate } = annotation;
          
          // Add the videoId to the annotation
          const annotationWithVideoId = {
            ...annotationWithoutDate,
            videoId: correspondingVideo.id,
            domicile: annotation.domicile || null,
            visiteuse: annotation.visiteuse || null
          };

          console.log('📝 Creating manual annotation with data:', JSON.stringify(annotationWithVideoId, null, 2));

          // Create annotation using the manual annotation service
          const createdAnnotation = await this.manualAnnotationService.createAnnotation(annotationWithVideoId);
          results.annotations.push(createdAnnotation);
          console.log('✅ Manual annotation created successfully:', createdAnnotation.id_sequence);
        } catch (error) {
          console.error('❌ Manual annotation creation failed:', annotation.id_sequence, error);
          results.errors.push({
            annotation: annotation.id_sequence || 'unknown',
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }
    } else {
      console.log('⚠️ No manual annotations provided or invalid format');
    }

    console.log('🎉 Manual Video Bulk upload completed');
    console.log('📊 Results:', {
      videos: results.videos.length,
      annotations: results.annotations.length,
      errors: results.errors.length
    });

    return results;
  }

  // New method for single file upload with annotation (for queue system)
  async uploadSingleFileWithAnnotation(
    file: { mimetype: string; size: number; originalname: string; buffer: Buffer }, 
    annotation?: any
  ) {
    console.log('🔍 Single file upload with annotation started');
    console.log('📁 File:', file.originalname);
    console.log('📝 Annotation provided:', !!annotation);
    
    const results: {
      videos: any[];
      annotations: any[];
      errors: Array<{ file?: string; annotation?: string; error: string }>;
    } = {
      videos: [],
      annotations: [],
      errors: []
    };

    // Check if it's a video file
    const isVideo = file.mimetype.startsWith('video/') || 
                   file.originalname.match(/\.(mp4|avi|mov|wmv|flv)$/i);

    if (isVideo) {
      try {
        console.log('📤 Uploading video:', file.originalname);
        const video = await this.uploadVideo(file);
        results.videos.push(video);
        
        console.log('✅ Video uploaded successfully:', file.originalname, '->', video.id);

        // If there's a corresponding annotation, process it
        if (annotation && annotation.id_sequence) {
          try {
            console.log('📝 Processing annotation for video:', annotation.id_sequence);
            
                      // Validate required fields
          if (!annotation.id_sequence || !annotation.annotation || !annotation.validateur || !annotation.commentaire) {
            console.error('❌ Missing required fields in annotation:', annotation);
            throw new Error(`Missing required fields. Required: id_sequence, annotation, validateur, commentaire. Received: ${JSON.stringify(annotation)}`);
          }

          // Filter out date_annotation since it's handled automatically by Prisma
          const { date_annotation, ...annotationWithoutDate } = annotation;
          
          // Add the videoId to the annotation
          const annotationWithVideoId = {
            ...annotationWithoutDate,
            videoId: video.id,
            domicile: annotation.domicile || null,
            visiteuse: annotation.visiteuse || null
          };

          console.log('📝 Creating manual annotation with data:', JSON.stringify(annotationWithVideoId, null, 2));

            // Create annotation using the manual annotation service
            const createdAnnotation = await this.manualAnnotationService.createAnnotation(annotationWithVideoId);
            results.annotations.push(createdAnnotation);
            console.log('✅ Manual annotation created successfully:', createdAnnotation.id_sequence);
          } catch (error) {
            console.error('❌ Manual annotation creation failed:', annotation.id_sequence, error);
            results.errors.push({
              annotation: annotation.id_sequence || 'unknown',
              error: error instanceof Error ? error.message : 'Unknown error'
            });
          }
        }
      } catch (error) {
        console.error('❌ Video upload failed:', file.originalname, error);
        results.errors.push({
          file: file.originalname,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    } else {
      console.log('⚠️ File is not a video, skipping:', file.originalname);
      results.errors.push({
        file: file.originalname,
        error: 'File is not a supported video format'
      });
    }

    console.log('🎉 Single file upload completed');
    console.log('📊 Results:', {
      videos: results.videos.length,
      annotations: results.annotations.length,
      errors: results.errors.length
    });

    return results;
  }
} 