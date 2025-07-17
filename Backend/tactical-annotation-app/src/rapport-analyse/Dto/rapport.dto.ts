import { IsString, IsNumber, IsArray, IsOptional } from 'class-validator';

export class CreateRapportAnalyseDto {
  
  @IsString()
  prediction_ia: string;

  @IsNumber()
  confiance: number;

  @IsString()
  annotation_humaine: string;

  @IsString()
  equipe: string;

  @IsArray()
  joueurs_detectes: number[];

  @IsString()
  commentaire_expert: string;

  @IsString()
  validation: string;

  @IsString()
  videoId : string;

  @IsString()
 annotationId : string;
}