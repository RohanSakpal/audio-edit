import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AudioMergeModule } from './audio-merge/audio-merge.module';
import { TrimMergeModule } from './trim-merge/trim-merge.module';
import { AudioLinkModule } from './audio-link/audio-link.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [AudioMergeModule, TrimMergeModule, AudioLinkModule, ServeStaticModule.forRoot({
    rootPath: join(__dirname, '..', 'uploads'),
    serveRoot: '/uploads', // adjust the path if needed
  }),],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
