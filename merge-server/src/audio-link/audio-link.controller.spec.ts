import { Test, TestingModule } from '@nestjs/testing';
import { AudioLinkController } from './audio-link.controller';

describe('AudioLinkController', () => {
  let controller: AudioLinkController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AudioLinkController],
    }).compile();

    controller = module.get<AudioLinkController>(AudioLinkController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
