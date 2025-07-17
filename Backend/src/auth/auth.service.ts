/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { RapportDto } from 'src/rapport/dto/rapport.dto';

@Injectable()
<<<<<<< HEAD:Backend/src/auth/auth.service.ts
export class AuthService {}
=======
export class RapportService {
  constructor(private prisma: PrismaService) {}

  async getRapport() {
    return await this.prisma.rapportAnalyse.findMany();
  }

  async createRapport(rapport: RapportDto) {
    return await this.prisma.rapportAnalyse.create({
      data: rapport,
    });
  }

  async getRapportById(id_sequence: RapportDto['id_sequence']) {
    return await this.prisma.rapportAnalyse.findUnique({
      where: {
        id_sequence: id_sequence,
      },
    });
  }

  async deleteRapport(id_sequence: RapportDto['id_sequence']) {
    return await this.prisma.rapportAnalyse.delete({
      where: {
        id_sequence: id_sequence,
      },
    });
  }
}
>>>>>>> 5bb0416c50996b885bdc903ec119809c644ef6af:Backend/tactical-annotation-app/src/rapport/rapport.service.ts
