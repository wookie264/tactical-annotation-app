/* eslint-disable prettier/prettier */
import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { UsersService } from './users.service';
import { RegisterDto } from './dto/users.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('register')
  async register(@Body() body: RegisterDto) {
    const existingUser = await this.usersService.findByUsername(body.username);
    if (existingUser) {
      throw new BadRequestException('Username already exists');
    }
    return this.usersService.createUser(body.username, body.password);
  }
}

