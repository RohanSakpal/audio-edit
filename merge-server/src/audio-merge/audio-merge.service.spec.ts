import { Test, TestingModule } from '@nestjs/testing';
import { AudioMergeService } from './audio-merge.service';

describe('AudioMergeService', () => {
  let service: AudioMergeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AudioMergeService],
    }).compile();

    service = module.get<AudioMergeService>(AudioMergeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
