import { Injectable } from '@nestjs/common';
import * as path from 'path';
import { readdirSync, unlinkSync } from 'fs';
import { join } from 'path';
import * as ffmpeg from 'fluent-ffmpeg';
import * as wav from 'node-wav';
import { Readable } from 'stream';

ffmpeg.setFfmpegPath('C:/ffmpeg/ffmpeg.exe');


@Injectable()
export class AudioLinkService {
  uploadDirectory = './uploads';

  constructor() {
  }

  clearUploadFolder() {
    const files = readdirSync(this.uploadDirectory);
    for (const file of files) {
      unlinkSync(join(this.uploadDirectory, file));
    }
  }

  storeFiles(files: Express.Multer.File[]): string[] {
    return files.map((file) => {
      const filePath = path.join(this.uploadDirectory, file.filename);
      return `http://localhost:3000/uploads/${file.filename}`; // adjust URL as needed
    });
  }

  async generatePeaksFromBuffer(buffer: Buffer, numPeaks: number = 1000): Promise<number[]> {
    const audioStream = new Readable();
    audioStream.push(buffer);
    audioStream.push(null);

    return new Promise<number[]>((resolve, reject) => {
      const chunks: Buffer[] = [];
      ffmpeg(audioStream)
        .format('wav')
        .audioCodec('pcm_s16le')
        .on('error', (err) => reject(err))
        .on('end', () => {
          // Decode the WAV data and extract peaks
          const wavBuffer = Buffer.concat(chunks);
          const { channelData } = wav.decode(wavBuffer);

          // Calculate peaks
          const peaks: number[] = [];
          const step = Math.floor(channelData[0].length / numPeaks);
          for (let i = 0; i < numPeaks; i++) {
            const segment = channelData[0].slice(i * step, (i + 1) * step);

            // Manually find the maximum absolute value in the segment
            let peak = 0;
            for (const value of segment) {
              const absValue = Math.abs(value);
              if (absValue > peak) {
                peak = absValue;
              }
            }
            peaks.push(peak);
          }
          resolve(peaks);
        })
        .pipe()
        .on('data', (chunk) => chunks.push(chunk));
    });
  }
}
