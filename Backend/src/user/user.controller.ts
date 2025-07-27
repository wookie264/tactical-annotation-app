/* eslint-disable prettier/prettier */
import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { UserService, CreateUserDto, UpdateUserDto } from './user.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private userService: UserService) {}

  @Get()
  async getAllUsers() {
    return await this.userService.getAllUsers();
  }

  @Get(':id')
  async getUserById(@Param('id') id: string) {
    return await this.userService.getUserById(id);
  }

  @Post()
  async createUser(@Body() createUserDto: CreateUserDto) {
    return await this.userService.createUser(createUserDto);
  }

  @Put(':id')
  async updateUser(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return await this.userService.updateUser(id, updateUserDto);
  }

  @Delete(':id')
  async deleteUser(@Param('id') id: string) {
    return await this.userService.deleteUser(id);
  }

  @Put('profile/me')
  async updateProfile(@Request() req, @Body() updateUserDto: UpdateUserDto) {
    return await this.userService.updateUserProfile(req.user.id, updateUserDto, req.user.isAdmin);
  }

  @Get('profile/me')
  async getProfile(@Request() req) {
    try {
      if (req.user.isAdmin) {
        const admin = await this.userService.getAdminById(req.user.id);
        return admin;
      }
      const user = await this.userService.getUserById(req.user.id);
      return user;
    } catch (error) {
      throw error;
    }
  }

  @Post('profile/change-password')
  async changePassword(@Request() req, @Body() body: { oldPassword: string; newPassword: string }) {
    try {
      if (req.user.isAdmin) {
        // Validate old password first
        await this.userService.validateAdminPassword(req.user.id, body.oldPassword);
        // Update password
        const result = await this.userService.updateUserProfile(req.user.id, { password: body.newPassword }, true);
        return result;
      } else {
        // For regular users, you might want to add similar validation
        const result = await this.userService.updateUserProfile(req.user.id, { password: body.newPassword }, false);
        return result;
      }
    } catch (error) {
      throw error;
    }
  }
} 