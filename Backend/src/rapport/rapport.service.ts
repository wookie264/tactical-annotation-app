/* eslint-disable prettier/prettier */
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { RapportDto } from 'src/rapport/dto/rapport.dto';
import { UpdateRapportDto } from 'src/rapport/dto/update-rapport.dto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import * as fs from 'fs';

@Injectable()
export class RapportService {
  constructor(private prisma: PrismaService) {}

  async getRapport() {
    return await this.prisma.rapportAnalyse.findMany({
      include: {
        annotation: {
          include: {
            video: true
          }
        }
      }
    });
  }

  async createRapport(rapport: RapportDto) {
    try {
      return await this.prisma.rapportAnalyse.create({
        data: rapport,
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new BadRequestException(`Rapport with id_sequence '${rapport.id_sequence}' already exists`);
        }
      }
      throw new BadRequestException('Failed to create rapport');
    }
  }

  async getRapportById(id_sequence: RapportDto['id_sequence']) {
    return await this.prisma.rapportAnalyse.findUnique({
      where: {
        id_sequence: id_sequence,
      },
      include: {
        annotation: {
          include: {
            video: true
          }
        }
      }
    });
  }

  async updateRapport(id_sequence: RapportDto['id_sequence'], updateRapportDto: UpdateRapportDto) {
    // Filter out undefined values
    const updateData = Object.fromEntries(
      Object.entries(updateRapportDto).filter(([, value]) => value !== undefined)
    );
    
    try {
      return await this.prisma.rapportAnalyse.update({
        where: {
          id_sequence: id_sequence,
        },
        data: updateData,
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`Rapport with id_sequence '${id_sequence}' not found`);
        }
      }
      throw new BadRequestException('Failed to update rapport');
    }
  }

  async deleteRapport(id_sequence: RapportDto['id_sequence']) {
    try {
      // First, get the rapport to find the associated annotation and video
      const rapport = await this.prisma.rapportAnalyse.findUnique({
        where: {
          id_sequence: id_sequence,
        },
        include: {
          annotation: {
            include: {
              video: true
            }
          }
        }
      });

      if (!rapport) {
        throw new NotFoundException(`Rapport with id_sequence '${id_sequence}' not found`);
      }

      // Delete the rapport
      await this.prisma.rapportAnalyse.delete({
        where: {
          id_sequence: id_sequence,
        },
      });

      // If there's an associated annotation, delete it and its video
      if (rapport.annotation) {
        // Delete the annotation
        await this.prisma.annotation.delete({
          where: {
            id: rapport.annotation.id
          }
        });

        // Delete the associated video and its file
        if (rapport.annotation.video) {
          // Delete the video file from the file system
          if (rapport.annotation.video.path && fs.existsSync(rapport.annotation.video.path)) {
            try {
              fs.unlinkSync(rapport.annotation.video.path);
            } catch (fileError) {
              console.error('Error deleting video file:', fileError);
              // Continue with database deletion even if file deletion fails
            }
          }

          // Delete the video record from database
          await this.prisma.video.delete({
            where: {
              id: rapport.annotation.video.id
            }
          });
        }
      }

      return { 
        message: 'Rapport, annotation, and associated video deleted successfully',
        deletedRapport: rapport.id_sequence,
        deletedAnnotation: rapport.annotation?.id_sequence || null,
        deletedVideo: rapport.annotation?.video?.filename || null
      };
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`Rapport with id_sequence '${id_sequence}' not found`);
        }
      }
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to delete rapport');
    }
  }
}
