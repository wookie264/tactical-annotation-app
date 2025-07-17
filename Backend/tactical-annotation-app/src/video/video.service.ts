import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateVideoDto } from 'src/video/Dto/video.dto';
@Injectable()
export class VideoService {


    constructor(private prisma: PrismaService) {}

  async create(data: CreateVideoDto) {
    return this.prisma.video.create({ data });
  }

  async findAll() {
    return this.prisma.video.findMany();
  }

  async findOne(id: string) {
    return this.prisma.video.findUnique({ where: { id } });
  }

  async update(id: string, data: CreateVideoDto) {
    return this.prisma.video.update({ where: { id }, data });
  }

  async remove(id: string) {
    return this.prisma.video.delete({ where: { id } });
  }
}
