import { Injectable } from '@nestjs/common';
import * as path from 'path';
import * as ffmpeg from 'fluent-ffmpeg';
import * as fs from 'fs';
import * as wav from 'wav';
import { promisify } from 'util';

const unlinkAsync = promisify(fs.unlink); 
ffmpeg.setFfmpegPath('C:/ffmpeg/ffmpeg.exe');


@Injectable()
export class AudioLinkService {
  uploadDirectory = './uploads';

  clearUploadFolder() {
    const files = fs.readdirSync(this.uploadDirectory);
    for (const file of files) {
      fs.unlinkSync(path.join(this.uploadDirectory, file));
    }
  }

  storeFiles(files: Express.Multer.File[]): string[] {
    return files.map((file) => {
      const filePath = path.join(this.uploadDirectory, file.filename);
      return `http://localhost:3000/uploads/${file.filename}`; // Adjust URL as needed
    });
  }

  
  // async generatePeaksFromFilePath(filePath: string, numPeaks: number = 1000): Promise<number[]> {
  //   return new Promise<number[]>((resolve, reject) => {
  //     const chunks: Buffer[] = [];
  //     ffmpeg(filePath)
  //       .format('wav')
  //       .audioCodec('pcm_s16le')
  //       .on('error', (err) => reject(err))
  //       .on('end', () => {
  //         // Decode the WAV data and extract peaks
  //         const wavBuffer = Buffer.concat(chunks);
  //         const { channelData } = wav.decode(wavBuffer);

  //         // Calculate peaks
  //         const peaks: number[] = [];
  //         const step = Math.floor(channelData[0].length / numPeaks);
  //         for (let i = 0; i < numPeaks; i++) {
  //           const segment = channelData[0].slice(i * step, (i + 1) * step);

  //           // Manually find the maximum absolute value in the segment
  //           let peak = 0;
  //           for (const value of segment) {
  //             const absValue = Math.abs(value);
  //             if (absValue > peak) {
  //               peak = absValue;
  //             }
  //           }
  //           peaks.push(peak);
  //         }
  //         resolve(peaks);
  //       })
  //       .pipe()
  //       .on('data', (chunk) => chunks.push(chunk));
  //   });
  // }

  async generatePeaksFromFilePath(filePath: string, numPeaks: number = 1000): Promise<number[]> {
    return new Promise<number[]>((resolve, reject) => {
      const outputWavPath = `${filePath}-temp.wav`;
      const peaks: number[] = [];

      // Step 1: Convert audio to WAV format and save to a temporary file
      ffmpeg(filePath)
        .audioChannels(1) // Mono channel
        .audioFrequency(8000) // Downsample to reduce data size
        .format('wav')
        .output(outputWavPath)
        .on('end', async () => {
          const reader = new wav.Reader();
          const fileStream = fs.createReadStream(outputWavPath);

          reader.on('format', (format) => {
            const step = Math.floor(format.sampleRate / numPeaks); // Calculate step size for numPeaks
            let sampleCount = 0;
            let peak = 0;

            reader.on('data', (chunk) => {
              for (let i = 0; i < chunk.length; i += 2) {
                const sample = chunk.readInt16LE(i);
                peak = Math.max(peak, Math.abs(sample));

                sampleCount++;
                if (sampleCount % step === 0) {
                  peaks.push(peak);
                  peak = 0;
                  if (peaks.length >= numPeaks) {
                    fileStream.unpipe(reader);
                    reader.end();
                    break;
                  }
                }
              }
            });

            reader.on('end', async () => {
              fileStream.close(); // Ensure fileStream is fully closed
              
              // Add a small delay before attempting to delete
              setTimeout(async () => {
                try {
                  await unlinkAsync(outputWavPath); // Delete the file after it's closed and delay
                } catch (unlinkError) {
                  console.error('Error deleting temporary file:', unlinkError.message);
                }
                resolve(peaks);
              }, 100); // 100ms delay to ensure OS releases file lock
            });
          });

          reader.on('error', async (error) => {
            fileStream.close(); // Close the file stream on error as well
            setTimeout(async () => {
              try {
                await unlinkAsync(outputWavPath);
              } catch (unlinkError) {
                console.error('Error deleting temporary file on error:', unlinkError.message);
              }
              reject(error);
            }, 100); // 100ms delay before deleting
          });

          // Pipe the WAV file data to the reader
          fileStream.pipe(reader);
        })
        .on('error', (err) => {
          reject(err);
        })
        .run();
    });
  }
}
