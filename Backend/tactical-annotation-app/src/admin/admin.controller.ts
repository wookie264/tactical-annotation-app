import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Delete,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { CreateUserDto } from 'src/admin/Dto/admin.dto';
import { CreateAdminDto } from 'src/admin/Dto/createAdmin.dto';

import { UpdatePasswordDto } from 'src/admin/Dto/update password.dto';

import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard'; // your JWT guard
import { RolesGuard } from 'src/RolesGuard/roles.guard';
//@UseGuards(JwtAuthGuard, new RolesGuard('admin'))

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}


@Get()
  async getAllAdmins() {
    return await this.adminService.findAllAdmins();
  }
   @Post()
  async createAdmin(@Body() dto: CreateAdminDto) {
    return this.adminService.createAdmin(dto);
  }
  @Post('users')
  async createUser(@Body() dto: CreateUserDto) {
    return this.adminService.createUser(dto);
  }

  @Patch('users/:id')
  async updateUser(@Param('id') id: string, @Body() dto: CreateUserDto) {
    return this.adminService.updateUser(id, dto);
  }

  @Delete('users/:id')
  async deleteUser(@Param('id') id: string) {
    return this.adminService.deleteUser(id);
  }

  @Get('users')
  async getAllUsers() {
    return this.adminService.getAllUsers();
  }

  @Patch('self/:id')
  async updateAdmin(@Param('id') id: string, @Body() dto: CreateUserDto) {
    return this.adminService.updateAdminAccount(id, dto);
  }

  @Patch('reset-password/user/:id')
  async resetUserPassword(
    @Param('id') id: string,
    @Body() dto: UpdatePasswordDto,
  ) {
    return this.adminService.resetUserPassword(id, dto.newPassword);
  }

  @Patch('reset-password/self/:id')
  async resetAdminPassword(
    @Param('id') id: string,
    @Body() dto: UpdatePasswordDto,
  ) {
    return this.adminService.resetAdminPassword(id, dto.newPassword);
  }
}
