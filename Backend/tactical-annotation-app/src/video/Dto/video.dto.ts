import { IsString, IsOptional } from 'class-validator';

export class CreateVideoDto {
  @IsString()
  path: string;

  @IsOptional()
  @IsString()
  annotationId?: string;
}
