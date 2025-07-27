/* eslint-disable prettier/prettier */
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ManualAnnotationDto } from './dto/manual-annotation.dto';
import { UpdateManualAnnotationDto } from './dto/update-manual-annotation.dto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import * as fs from 'fs';


@Injectable()
export class ManualAnnotationService {
    constructor(private prisma:PrismaService) {}

    async getAnnotation(){
        return await this.prisma.annotation.findMany({
            include: {
                video: true
            }
        });
    }

    async createAnnotation(annotation: ManualAnnotationDto){
        try {
            console.log('📝 Creating annotation with data:', annotation);
            const result = await this.prisma.annotation.create({data:annotation,})
            console.log('✅ Annotation created successfully:', result.id_sequence);
            return result;
        } catch (error) {
            console.error('❌ Error creating annotation:', error);
            if (error instanceof PrismaClientKnownRequestError) {
                if (error.code === 'P2002') {
                    throw new BadRequestException(`Annotation with id_sequence '${annotation.id_sequence}' already exists`);
                }
            }
            throw new BadRequestException(`Failed to create annotation: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async getAnnotationById(id_sequence: ManualAnnotationDto['id_sequence']){
        return await  this.prisma.annotation.findUnique({
            where: {
                id_sequence:id_sequence,
            },
        })
    }
    

    async deleteAnnotation(id_sequence:ManualAnnotationDto['id_sequence']){
        try {
            // First, get the annotation to find the associated video
            const annotation = await this.prisma.annotation.findUnique({
                where: {
                    id_sequence: id_sequence,
                },
                include: {
                    video: true,
                    rapportAnalyses: true
                }
            });

            if (!annotation) {
                throw new NotFoundException(`Annotation with id_sequence '${id_sequence}' not found`);
            }

            // Delete all associated rapports first
            if (annotation.rapportAnalyses && annotation.rapportAnalyses.length > 0) {
                await this.prisma.rapportAnalyse.deleteMany({
                    where: {
                        annotationId: annotation.id
                    }
                });
            }

            // Delete the annotation
            await this.prisma.annotation.delete({
                where: {
                    id_sequence: id_sequence,
                }
            });

            // Delete the associated video and its file
            if (annotation.video) {
                // Delete the video file from the file system
                if (annotation.video.path && fs.existsSync(annotation.video.path)) {
                    try {
                        fs.unlinkSync(annotation.video.path);
                    } catch (fileError) {
                        console.error('Error deleting video file:', fileError);
                        // Continue with database deletion even if file deletion fails
                    }
                }

                // Delete the video record from database
                await this.prisma.video.delete({
                    where: {
                        id: annotation.video.id
                    }
                });
            }

            return { 
                message: 'Annotation and associated video deleted successfully',
                deletedAnnotation: annotation.id_sequence,
                deletedVideo: annotation.video?.filename || null
            };
        } catch (error) {
            if (error instanceof PrismaClientKnownRequestError) {
                if (error.code === 'P2025') {
                    throw new NotFoundException(`Annotation with id_sequence '${id_sequence}' not found`);
                }
            }
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new BadRequestException('Failed to delete annotation');
        }
    }

    async updateAnnotation(id_sequence:ManualAnnotationDto['id_sequence'], annotation:UpdateManualAnnotationDto){
        // Filter out undefined values
        const updateData = Object.fromEntries(
            Object.entries(annotation).filter(([, value]) => value !== undefined)
        );
        
        try {
            return await this.prisma.annotation.update({
                where:{
                    id_sequence:id_sequence,
                },
                data: updateData,
            })
        } catch (error) {
            if (error instanceof PrismaClientKnownRequestError) {
                if (error.code === 'P2025') {
                    throw new NotFoundException(`Annotation with id_sequence '${id_sequence}' not found`);
                }
            }
            throw new BadRequestException('Failed to update annotation');
        }
    }
}
