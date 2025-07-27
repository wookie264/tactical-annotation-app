import { Test, TestingModule } from '@nestjs/testing';
import { ManualAnnotationController } from './manual-annotation.controller';

describe('ManualAnnotationController', () => {
  let controller: ManualAnnotationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ManualAnnotationController],
    }).compile();

    controller = module.get<ManualAnnotationController>(ManualAnnotationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
