import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AnnotationDto } from './dto/annotation.dto';


@Injectable()
export class AnnotationService {
    constructor(private prisma:PrismaService) {}

    async getAnnotation(){
        return await this.prisma.annotation.findMany();
    }

    async createAnnotation(annotation: AnnotationDto){
        return await this.prisma.annotation.create({data:annotation,})
    }

    async getAnnotationById(id_sequence: AnnotationDto['id_sequence']){
        return await  this.prisma.annotation.findUnique({
            where: {
                id_sequence:id_sequence,
            },
        })
    }

    async deleteAnnotation(id_sequence:AnnotationDto['id_sequence']){
        return await this.prisma.annotation.delete({
            where:{
                id_sequence:id_sequence,
            }
        })
    }

    async updateAnnotation(id_sequence:AnnotationDto['id_sequence'], annotation:AnnotationDto){
        return await this.prisma.annotation.update({
            where:{
                id_sequence:id_sequence,
            },
            data: annotation,
        })
    }
}
