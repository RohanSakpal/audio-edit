import { Injectable } from '@nestjs/common';
import * as ffmpeg from 'fluent-ffmpeg';
import { Readable } from 'stream';
import * as fs from 'fs';

ffmpeg.setFfmpegPath('C:/ffmpeg/ffmpeg.exe');
@Injectable()
export class AudioMergeService {

  async mergeAudioFiles(files: Express.Multer.File[]): Promise<Readable> {
    return new Promise((resolve, reject) => {

      const tempFiles: string[] = [];

      // Write each buffer to a temporary file
      files.forEach((file, index) => {
        const tempFilePath = `tempfile-${index}.mp3`;
        fs.writeFileSync(tempFilePath, file.buffer); // Write buffer to file
        tempFiles.push(tempFilePath); // Add file path to the list
      });

      // Prepare ffmpeg command with the 'concat' protocol for multiple files
      const mergedFilePath = 'output.mp3'; // Output file

      // Build the ffmpeg input list file (a temporary text file)
      const concatFilePath = 'concat_list.txt';
      const concatFileContent = tempFiles.map((filePath) => `file '${filePath}'`).join('\n');
      fs.writeFileSync(concatFilePath, concatFileContent); // Create concat file
      // Run the ffmpeg command to merge files
      ffmpeg()
        .input(concatFilePath) // Use concat protocol
        .inputOptions(['-f concat', '-safe 0'])
        .outputOptions('-c copy') // Keep original codec
        .on('end', () => {
          // Once the merging is done, clean up temp files and resolve
          tempFiles.forEach((tempFile) => fs.unlinkSync(tempFile)); // Remove temporary input files
          fs.unlinkSync(concatFilePath); // Remove concat list file

          // Create a readable stream for the final merged file
          const stream = fs.createReadStream(mergedFilePath); 
          resolve(stream);
        })
        .on('error', (err) => {
          console.error('Error during audio merging:', err);
          reject(err);
        })
        .save(mergedFilePath); // Save the merged audio to output.mp3
    });
  }
}
