import {IsDate, IsNotEmpty,IsString} from "class-validator"

export class AnnotationDto {
  @IsString()
  @IsNotEmpty()
  id_sequence: string;

  @IsString()
  @IsNotEmpty()
  annotation: string;

  @IsString()
  @IsNotEmpty()
  validateur: string;

  @IsString()
  commentaire: string;

  @IsString()
  @IsNotEmpty()
  videoId: string; // Id ObjectId de la vidéo
}
