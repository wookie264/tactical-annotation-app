import { IsString, IsDateString, IsOptional } from 'class-validator';
export class CreateAnnotationDto {
  @IsString()
  id_sequence: string;

  @IsString() 
  
  annotation: string;

  @IsString()
  validateur: string;

  @IsString()
  commentaire: string;
}