import { Body, Controller, Post, Res, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { TrimMergeService } from './trim-merge.service';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';

@Controller('trim-merge')
export class TrimMergeController {
    constructor(private readonly audioMergeService: TrimMergeService) {}

  @Post('merge-with-trims')
  @UseInterceptors(FilesInterceptor('files', 10)) // Allow up to 10 files
  async mergeAudioWithTrims(
    @UploadedFiles() files: Express.Multer.File[],
    @Body('fileTrimPairs') fileTrimPairs: string, // The file and trim data as JSON
    @Res() res: Response
  ) {
    const parsedFileTrimPairs = JSON.parse(fileTrimPairs); // Parse the file-trim pairing from JSON

    // Combine files and trim data into an array of objects
    const fileTrimData = parsedFileTrimPairs.map((pair: any, index: number) => ({
      file: files[index],
      trims: pair.trims || [] // Default to no trimming if not provided
    }));

    try {
      const mergedStream = await this.audioMergeService.mergeAudioWithTrims(fileTrimData);
      res.set({
        'Content-Type': 'audio/mpeg',
        'Content-Disposition': 'attachment; filename=merged-audio.mp3',
      });
      mergedStream.pipe(res); // Pipe the merged audio file to the response
    } catch (error) {
      console.error('Error during audio merging with trims:', error);
      res.status(500).json({ message: 'Error during audio merging.' });
    }
  }
}
