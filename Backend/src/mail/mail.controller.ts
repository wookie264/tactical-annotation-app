import { Body, Controller, Post } from '@nestjs/common';
import { MailService } from './mail.service';
import { MailDto } from './dto/mail.dto';

@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Post('send')
  async sendMail(@Body() mailDto: MailDto) {
    return this.mailService.sendMail(mailDto);
  }
} 