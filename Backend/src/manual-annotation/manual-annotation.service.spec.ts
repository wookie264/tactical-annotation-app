import { Test, TestingModule } from '@nestjs/testing';
import { ManualAnnotationService } from './manual-annotation.service';

describe('ManualAnnotationService', () => {
  let service: ManualAnnotationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ManualAnnotationService],
    }).compile();

    service = module.get<ManualAnnotationService>(ManualAnnotationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
