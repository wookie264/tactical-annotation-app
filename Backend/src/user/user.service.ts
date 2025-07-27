/* eslint-disable prettier/prettier */
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

export interface CreateUserDto {
  username: string;
  fullname: string;
  email: string;
  password: string;
  phone?: string;
}

export interface UpdateUserDto {
  username?: string;
  fullname?: string;
  email?: string;
  phone?: string;
  password?: string;
}

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async getAllUsers() {
    return await this.prisma.user.findMany({
      select: {
        id: true,
        username: true,
        fullname: true,
        email: true,
        phone: true
      }
    });
  }

  async getUserById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        fullname: true,
        email: true,
        phone: true
      }
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async getAdminById(id: string) {
    const admin = await this.prisma.admin.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        fullname: true,
        email: true,
        phone: true
      }
    });

    if (!admin) {
      throw new NotFoundException('Admin not found');
    }

    return admin;
  }

  async validateAdminPassword(id: string, oldPassword: string) {
    const admin = await this.prisma.admin.findUnique({
      where: { id },
      select: {
        id: true,
        password: true
      }
    });

    if (!admin) {
      throw new NotFoundException('Admin not found');
    }

    const isPasswordValid = await bcrypt.compare(oldPassword, admin.password);
    if (!isPasswordValid) {
      throw new BadRequestException('Ancien mot de passe incorrect');
    }

    return true;
  }

  async createUser(createUserDto: CreateUserDto) {
    try {
      const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
      
      return await this.prisma.user.create({
        data: {
          ...createUserDto,
          password: hashedPassword
        },
        select: {
          id: true,
          username: true,
          fullname: true,
          email: true,
          phone: true
        }
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new BadRequestException('Username or email already exists');
      }
      throw new BadRequestException('Failed to create user');
    }
  }

  async updateUser(id: string, updateUserDto: UpdateUserDto) {
    try {
      const updateData: any = { ...updateUserDto };
      
      // Hash password if provided
      if (updateUserDto.password) {
        updateData.password = await bcrypt.hash(updateUserDto.password, 10);
      }

      return await this.prisma.user.update({
        where: { id },
        data: updateData,
        select: {
          id: true,
          username: true,
          fullname: true,
          email: true,
          phone: true
        }
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException('User not found');
      }
      if (error.code === 'P2002') {
        throw new BadRequestException('Username or email already exists');
      }
      throw new BadRequestException('Failed to update user');
    }
  }

  async deleteUser(id: string) {
    try {
      await this.prisma.user.delete({
        where: { id }
      });
      return { message: 'User deleted successfully' };
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException('User not found');
      }
      throw new BadRequestException('Failed to delete user');
    }
  }

  async updateUserProfile(id: string, updateUserDto: UpdateUserDto, isAdmin: boolean = false) {
    try {
      const updateData: any = { ...updateUserDto };
      
      // Hash password if provided
      if (updateUserDto.password) {
        updateData.password = await bcrypt.hash(updateUserDto.password, 10);
      }

      if (isAdmin) {
        return await this.prisma.admin.update({
          where: { id },
          data: updateData,
          select: {
            id: true,
            username: true,
            fullname: true,
            email: true,
            phone: true
          }
        });
      } else {
        return await this.prisma.user.update({
          where: { id },
          data: updateData,
          select: {
            id: true,
            username: true,
            fullname: true,
            email: true,
            phone: true
          }
        });
      }
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException('User not found');
      }
      if (error.code === 'P2002') {
        throw new BadRequestException('Username or email already exists');
      }
      throw new BadRequestException('Failed to update profile');
    }
  }
} 