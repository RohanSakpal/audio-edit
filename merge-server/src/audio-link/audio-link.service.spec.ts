import { Test, TestingModule } from '@nestjs/testing';
import { AudioLinkService } from './audio-link.service';

describe('AudioLinkService', () => {
  let service: AudioLinkService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AudioLinkService],
    }).compile();

    service = module.get<AudioLinkService>(AudioLinkService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
