import { IsString, MinLength } from 'class-validator';

export class UpdatePasswordDto {
  @MinLength(6)
  @IsString()
  newPassword: string;
}
