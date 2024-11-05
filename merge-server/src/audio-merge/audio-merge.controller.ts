import {
    Controller,
    Post,
    UploadedFiles,
    UseInterceptors,
    Res
  } from '@nestjs/common';
  import { FileFieldsInterceptor, FilesInterceptor } from '@nestjs/platform-express';
  import { Response } from 'express';
  import { AudioMergeService } from './audio-merge.service';

@Controller('audio-merge')
export class AudioMergeController {
    constructor(private readonly audioMergeService: AudioMergeService) {}

    @Post('merge')
  @UseInterceptors(FilesInterceptor('files', 10)) // Allow multiple file uploads
  async mergeAudioFiles(@UploadedFiles() files: Express.Multer.File[], @Res() res: Response) {
    try {
      const mergedStream = await this.audioMergeService.mergeAudioFiles(files);

      res.set({
        'Content-Type': 'audio/mpeg',
        'Content-Disposition': 'attachment; filename=merged-audio.mp3',
      });
      
      mergedStream.pipe(res);
    } catch (error) {
      console.error('Error during audio merging:', error);
      res.status(500).json({ message: 'Error during audio merging.' });
    }
  }
}
