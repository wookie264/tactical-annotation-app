/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findByUsername(username: string) {
    return this.prisma.user.findUnique({
      where: { username },
    });
  }

  async createUser(username: string, password: string) {
    const hashed = await bcrypt.hash(password, 10);
    return this.prisma.user.create({
      data: { username, password: hashed },
    });
  }
}
