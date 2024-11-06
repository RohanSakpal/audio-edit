import { Controller, Post, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { AudioLinkService } from './audio-link.service';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

@Controller('audio-link')
export class AudioLinkController {
    constructor(private readonly fileUploadService: AudioLinkService) {}

  @Post('multiple')
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const filename = `${uuidv4()}${path.extname(file.originalname)}`;
          cb(null, filename);
        },
      }),
    }),
  )
  async uploadMultipleFiles(@UploadedFiles() files: Express.Multer.File[]) {
    // Clear the uploads folder before processing new files
    //this.fileUploadService.clearUploadFolder();

    // Proceed to store and return the new file URLs
    const fileUrls = this.fileUploadService.storeFiles(files);
    return { files: fileUrls };
  }

  // @Post('peaks')
  // @UseInterceptors(FilesInterceptor('files')) // Enable multiple file uploads
  // async getAudioPeaks(@UploadedFiles() files: Express.Multer.File[]) {
  //   const results = await Promise.all(
  //     files.map(async (file) => {
  //       const peaks = await this.fileUploadService.generatePeaksFromBuffer(file.buffer);
  //       return {
  //         fileName: file.originalname,
  //         peaks,
  //       };
  //     }),
  //   );

  //   return results;
  // }

  @Post('upload-and-peaks')
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const filename = `${uuidv4()}${path.extname(file.originalname)}`;
          cb(null, filename);
        },
      }),
    }),
  )
  async uploadFilesAndGeneratePeaks(@UploadedFiles() files: Express.Multer.File[]) {
    // Clear the uploads folder before processing new files, if needed
    // this.fileUploadService.clearUploadFolder();

    // Process each file: store it and generate peaks
    const results = await Promise.all(
      files.map(async (file) => {
        // Generate file URL
        const fileUrl = `http://localhost:3000/uploads/${file.filename}`;

        // Generate peaks from file path
        const peaks = await this.fileUploadService.generatePeaksFromFilePath(
          path.join(this.fileUploadService.uploadDirectory, file.filename),
        );

        return {
          fileUrl,
          fileName: file.originalname,
          peaks,
        };
      }),
    );

    return { files: results };
  }
}
