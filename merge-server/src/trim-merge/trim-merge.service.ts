import { Injectable } from '@nestjs/common';
import * as ffmpeg from 'fluent-ffmpeg';
import * as fs from 'fs';
import { Readable } from 'stream';

ffmpeg.setFfmpegPath('C:/ffmpeg/ffmpeg.exe');

@Injectable()
export class TrimMergeService {
    async mergeAudioWithTrims(fileTrimPairs: { file: Express.Multer.File, trims: { start: number, end: number }[] }[]): Promise<Readable> {
        return new Promise((resolve, reject) => {
          const tempFiles: string[] = [];
          const trimmedFiles: string[] = [];
    
          // Process each file and its corresponding trims
          const processNextFile = (index: number) => {
            if (index >= fileTrimPairs.length) {
              this.mergeFiles(trimmedFiles, resolve, reject); // Merge when all files are processed
              return;
            }
    
            const { file, trims } = fileTrimPairs[index]; // Get the file and its trims
            const filePath = `tempfile-${index}.mp3`;
            fs.writeFileSync(filePath, file.buffer); // Write file to disk
            tempFiles.push(filePath);
    
            if (!trims || trims.length === 0) {
              // No trimming needed, use entire file
              trimmedFiles.push(filePath);
              processNextFile(index + 1); // Move to the next file
            } else {
              // Trim sections using ffmpeg
              this.trimAudio(filePath, trims)
                .then((trimmedFilePaths) => {
                  trimmedFiles.push(...trimmedFilePaths); // Add trimmed parts
                  processNextFile(index + 1); // Move to the next file
                })
                .catch((error) => reject(error));
            }
          };
    
          // Start processing files
          processNextFile(0);
        });
      }
    
      // Helper method to trim a file based on multiple trim instructions
      async trimAudio(filePath: string, trimTimes: { start: number, end: number }[]): Promise<string[]> {
        return new Promise((resolve, reject) => {
          const trimmedFiles: string[] = [];
    
          const processNextTrim = (index: number) => {
            if (index >= trimTimes.length) {
              resolve(trimmedFiles); // All trims processed
              return;
            }
    
            const { start, end } = trimTimes[index];
            const trimmedFilePath = `trimmed-${index}-${Date.now()}.mp3`;
    
            ffmpeg(filePath)
              .setStartTime(start)
              .setDuration(end - start)
              .output(trimmedFilePath)
              .on('end', () => {
                trimmedFiles.push(trimmedFilePath); // Add trimmed part
                processNextTrim(index + 1); // Process next trim
              })
              .on('error', (err) => reject(err))
              .run();
          };
    
          processNextTrim(0); // Start processing trims
        });
      }
    
      // Method to merge all files (trimmed or full)
      mergeFiles(trimmedFiles: string[], resolve: Function, reject: Function): void {
        const mergedFilePath = 'output.mp3';
        const concatFilePath = 'concat_list.txt';
        const concatFileContent = trimmedFiles.map((filePath) => `file '${filePath}'`).join('\n');
        fs.writeFileSync(concatFilePath, concatFileContent);
    
        ffmpeg()
          .input(concatFilePath)
          .inputOptions(['-f concat', '-safe 0'])
          .outputOptions('-c copy')
          .on('end', () => {
            const mergedStream = fs.createReadStream(mergedFilePath);
            resolve(mergedStream); // Resolve with the merged stream
    
            // Clean up temporary files
            trimmedFiles.forEach((file) => fs.unlinkSync(file));
            fs.unlinkSync(concatFilePath);
          })
          .on('error', (err) => reject(err))
          .save(mergedFilePath);
      }
}
