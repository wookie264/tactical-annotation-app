/* eslint-disable prettier/prettier */

import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, pass: string) {
  console.log('🧪 Login attempt:', { username, pass });

  let user = await this.prisma.admin.findUnique({ where: { username } });
  let role = 'admin';

  if (!user) {
    user = await this.prisma.user.findUnique({ where: { username } });
    role = 'user';
  }

  console.log('🔍 Fetched user from DB:', user);

  if (!user) {
    console.log('❌ User not found');
    throw new UnauthorizedException('Invalid credentials');
  }

  const isPasswordMatch = await bcrypt.compare(pass, user.password);
  console.log('🔐 Password match result:', isPasswordMatch);

  if (isPasswordMatch) {
    console.log('✅ Login successful');
    return { id: user.id, username: user.username, role };
  }

  console.log('❌ Password mismatch');
  throw new UnauthorizedException('Invalid credentials');
}

  async login(username: string, password: string) {
    let user = await this.prisma.admin.findUnique({ where: { username } });
    let role = 'admin';

    if (!user) {
      user = await this.prisma.user.findUnique({ where: { username } });
      role = 'user';
    }

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: user.id, username: user.username, role };
    const token = this.jwtService.sign(payload);

    return { access_token: token, role };
  }
}
