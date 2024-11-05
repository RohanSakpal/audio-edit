import { Test, TestingModule } from '@nestjs/testing';
import { TrimMergeService } from './trim-merge.service';

describe('TrimMergeService', () => {
  let service: TrimMergeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TrimMergeService],
    }).compile();

    service = module.get<TrimMergeService>(TrimMergeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
