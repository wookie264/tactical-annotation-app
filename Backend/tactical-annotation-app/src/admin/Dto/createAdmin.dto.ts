// src/admin/dto/create-admin.dto.ts
import { IsString, IsEmail, MinLength } from 'class-validator';

export class CreateAdminDto {
  @IsString()
  username: string;

  @IsEmail()
  email: string;

  @MinLength(6)
  password: string;

  @IsString()
  phoneNumber: string;
}
