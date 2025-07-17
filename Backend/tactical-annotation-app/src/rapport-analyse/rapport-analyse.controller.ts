import { Controller } from '@nestjs/common';
import { RapportAnalyseService } from './rapport-analyse.service';

@Controller('rapport-analyse')
export class RapportAnalyseController {
  constructor(private readonly rapportAnalyseService: RapportAnalyseService) {}
}
