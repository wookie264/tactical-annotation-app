import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { MailDto } from './dto/mail.dto';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendMail(mailDto: MailDto) {
    try {
      const info = await this.transporter.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: mailDto.to,
        subject: mailDto.subject,
        text: mailDto.text,
        html: mailDto.html,
      });
      return { messageId: info.messageId, accepted: info.accepted };
    } catch (error) {
      throw new InternalServerErrorException('Failed to send email: ' + error.message);
    }
  }
} 