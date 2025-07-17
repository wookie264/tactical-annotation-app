import { Test, TestingModule } from '@nestjs/testing';
import { RapportAnalyseController } from './rapport-analyse.controller';
import { RapportAnalyseService } from './rapport-analyse.service';

describe('RapportAnalyseController', () => {
  let controller: RapportAnalyseController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RapportAnalyseController],
      providers: [RapportAnalyseService],
    }).compile();

    controller = module.get<RapportAnalyseController>(RapportAnalyseController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
