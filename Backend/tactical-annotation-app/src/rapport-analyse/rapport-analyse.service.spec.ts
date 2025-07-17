import { Test, TestingModule } from '@nestjs/testing';
import { RapportAnalyseService } from './rapport-analyse.service';

describe('RapportAnalyseService', () => {
  let service: RapportAnalyseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RapportAnalyseService],
    }).compile();

    service = module.get<RapportAnalyseService>(RapportAnalyseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
