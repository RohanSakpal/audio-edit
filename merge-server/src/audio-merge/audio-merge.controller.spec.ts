import { Test, TestingModule } from '@nestjs/testing';
import { AudioMergeController } from './audio-merge.controller';

describe('AudioMergeController', () => {
  let controller: AudioMergeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AudioMergeController],
    }).compile();

    controller = module.get<AudioMergeController>(AudioMergeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
