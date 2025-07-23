
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from 'src/admin/Dto/admin.dto';
import { CreateAdminDto } from 'src/admin/Dto/createAdmin.dto';
import { JwtService } from '@nestjs/jwt';

import { ConflictException } from '@nestjs/common';


@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService,private jwtService: JwtService) {}

  async createUser(dto: CreateUserDto) {
  try {
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        username: dto.username,
        email: dto.email,
        password: hashedPassword,
        phoneNumber: dto.phoneNumber,
      },
    });

    return {
      message: 'User created successfully',
      username: dto.username,
      password: dto.password,
    };
  } catch (error) {
    if (error.code === 'P2002') {
      throw new ConflictException('Username or email already exists');
    }
    throw error;
  }
}

  async updateUser(id: string, dto: CreateUserDto) {
    const updated = await this.prisma.user.update({
      where: { id },
      data: dto,
    });

    return {
      message: 'User updated successfully',
      user: updated,
    };
  }

  async deleteUser(id: string) {
    await this.prisma.user.delete({ where: { id } });
    return { message: 'User deleted successfully' };
  }

  async getAllUsers() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        phoneNumber: true,
      },
    });
  }

  async updateAdminAccount(id: string, dto: CreateUserDto) {
    const updated = await this.prisma.admin.update({
      where: { id },
      data: dto,
    });

    return {
      message: 'Admin account updated successfully',
      admin: updated,
    };
  }

  async resetUserPassword(id: string, newPassword: string) {
    const hashed = await bcrypt.hash(newPassword, 10);
    const user = await this.prisma.user.update({
      where: { id },
      data: { password: hashed },
    });

    return {
      message: 'User password updated successfully',
      username: user.username,
      password: newPassword,
    };
  }
 async findAllAdmins() {
    return await this.prisma.admin.findMany(); // Fetch all admins
  }
  async resetAdminPassword(id: string, newPassword: string) {
    const hashed = await bcrypt.hash(newPassword, 10);
    const admin = await this.prisma.admin.update({
      where: { id },
      data: { password: hashed },
    });

    return {
      message: 'Admin password updated successfully',
      username: admin.username,
      password: newPassword,
    };
  }




  async createAdmin(dto: CreateAdminDto) {
    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const admin = await this.prisma.admin.create({
      data: {
        username: dto.username,
        email: dto.email,
        password: hashedPassword,
      },
    });

    // Return username and plain password (only for testing!)
    return {
      message: 'Admin created successfully',
      username: dto.username,
      password: dto.password,
    };
  }
}
