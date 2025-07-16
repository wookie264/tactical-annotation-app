import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AnnotationService {
    constructor(private prisma:PrismaService) {}

    async getAnnotation(){
        return await this.prisma.annotation.findMany();
    }

    async createAnnotation(annotation: any){
        return await this.prisma.annotation.create({data:annotation,})
    }

    async getAnnotationById(id_sequence:string){
        return await  this.prisma.annotation.findUnique({
            where: {
                id_sequence:id_sequence,
            },
        })
    }

    async deleteAnnotation(id_sequence:string){
        return await this.prisma.annotation.delete({
            where:{
                id_sequence:id_sequence,
            }
        })
    }

    async updateAnnotation(id_sequence:string, annotation:any){
        return await this.prisma.annotation.update({
            where:{
                id_sequence:id_sequence,
            },
            data: annotation,
        })
    }
}
