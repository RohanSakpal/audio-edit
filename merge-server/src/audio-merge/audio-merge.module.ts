import { Module } from '@nestjs/common';
import { AudioMergeController } from './audio-merge.controller';
import { AudioMergeService } from './audio-merge.service';

@Module({
    controllers: [AudioMergeController],
    providers: [AudioMergeService],
})
export class AudioMergeModule {

}
