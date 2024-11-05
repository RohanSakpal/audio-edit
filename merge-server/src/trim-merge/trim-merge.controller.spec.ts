import { Test, TestingModule } from '@nestjs/testing';
import { TrimMergeController } from './trim-merge.controller';

describe('TrimMergeController', () => {
  let controller: TrimMergeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TrimMergeController],
    }).compile();

    controller = module.get<TrimMergeController>(TrimMergeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
