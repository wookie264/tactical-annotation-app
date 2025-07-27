/* eslint-disable prettier/prettier */
import { Injectable, UnauthorizedException, NotFoundException, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { randomBytes } from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private emailService: EmailService,
  ) {}

  async validateUser(username: string, pass: string) {
    // Try to find user first
    let user = await this.prisma.user.findUnique({ where: { username } });
    let isAdmin = false;

    // If not found, try admin
    if (!user) {
      user = await this.prisma.admin.findUnique({ where: { username } });
      isAdmin = true;
    }

    if (user && (await bcrypt.compare(pass, user.password))) {
      return { 
        id: user.id, 
        username: user.username, 
        fullname: user.fullname,
        email: user.email,
        phone: user.phone,
        isAdmin 
      };
    }
    throw new UnauthorizedException('Invalid credentials');
  }

  async validateAdmin(username: string, pass: string) {
    const admin = await this.prisma.admin.findUnique({ where: { username } });
    if (admin && (await bcrypt.compare(pass, admin.password))) {
      return { 
        id: admin.id, 
        username: admin.username, 
        fullname: admin.fullname,
        email: admin.email,
        phone: admin.phone,
        isAdmin: true 
      };
    }
    throw new UnauthorizedException('Invalid admin credentials');
  }

  login(user: { id: string; username: string; fullname: string; email: string; phone?: string; isAdmin: boolean }, rememberMe: boolean = false) {
    const payload = { 
      sub: user.id, 
      username: user.username, 
      fullname: user.fullname,
      email: user.email,
      phone: user.phone,
      isAdmin: user.isAdmin 
    };
    
    const expiresIn = rememberMe ? '30d' : '24h';
    
    return {
      access_token: this.jwtService.sign(payload, { expiresIn }),
      expires_in: expiresIn,
      user: {
        id: user.id,
        username: user.username,
        fullname: user.fullname,
        email: user.email,
        phone: user.phone,
        isAdmin: user.isAdmin
      }
    };
  }

  async forgotPassword(email: string) {
    // Check both user and admin tables
    let user = await this.prisma.user.findUnique({ where: { email } });
    let isAdmin = false;

    if (!user) {
      user = await this.prisma.admin.findUnique({ where: { email } });
      isAdmin = true;
    }

    if (!user) {
      throw new NotFoundException('User not found with this email');
    }

    // Generate reset token
    const resetToken = randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

    // Update user with reset token
    if (isAdmin) {
      await this.prisma.admin.update({
        where: { id: user.id },
        data: { 
          resetToken,
          resetTokenExpiry 
        }
      });
    } else {
      await this.prisma.user.update({
        where: { id: user.id },
        data: { 
          resetToken,
          resetTokenExpiry 
        }
      });
    }

    // Send email with reset link
    const emailSent = await this.emailService.sendPasswordResetEmail(
      user.email, 
      resetToken, 
      user.username
    );

    if (!emailSent) {
      throw new BadRequestException('Failed to send reset email. Please try again later.');
    }

    return {
      message: 'Password reset link sent to your email'
    };
  }

  async resetPassword(token: string, newPassword: string) {
    // Check both user and admin tables
    let user = await this.prisma.user.findFirst({ 
      where: { 
        resetToken: token,
        resetTokenExpiry: { gt: new Date() }
      } 
    });
    let isAdmin = false;

    if (!user) {
      user = await this.prisma.admin.findFirst({ 
        where: { 
          resetToken: token,
          resetTokenExpiry: { gt: new Date() }
        } 
      });
      isAdmin = true;
    }

    if (!user) {
      throw new NotFoundException('Invalid or expired reset token');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user with new password and clear reset token
    if (isAdmin) {
      await this.prisma.admin.update({
        where: { id: user.id },
        data: { 
          password: hashedPassword,
          resetToken: null,
          resetTokenExpiry: null
        }
      });
    } else {
      await this.prisma.user.update({
        where: { id: user.id },
        data: { 
          password: hashedPassword,
          resetToken: null,
          resetTokenExpiry: null
        }
      });
    }

    return { message: 'Password reset successfully' };
  }
}

