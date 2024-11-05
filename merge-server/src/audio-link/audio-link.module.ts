import { MiddlewareConsumer, Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { AudioLinkController } from './audio-link.controller';
import { AudioLinkService } from './audio-link.service';
import { ClearUploadFolderMiddleware } from './clear-upload-folder.middleware';
import * as multer from 'multer';

@Module({
  imports: [
    MulterModule.register({
      storage: multer.memoryStorage(), // Configure Multer to store files in memory
    }),
  ],
  controllers: [AudioLinkController],
  providers: [AudioLinkService]
})
export class AudioLinkModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(ClearUploadFolderMiddleware)
      .forRoutes(AudioLinkController);
  }
}
