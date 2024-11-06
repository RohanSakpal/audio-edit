import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AudioService {

  private mergeApiUrl = 'http://localhost:3000/audio-merge/merge'; // Change to your NestJS API URL

  private trimMergeApiUrl = 'http://localhost:3000/trim-merge/merge-with-trims';

  private audioURLApi = 'http://localhost:3000/audio-link/multiple';

  private audioURLPeaksApi = 'http://localhost:3000/audio-link/upload-and-peaks';

  constructor(private http: HttpClient) { }

  mergeAudioFiles(files: File[]): Promise<Blob> {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file, file.name));

    return this.http
      .post(this.mergeApiUrl, formData, { responseType: 'blob' })
      .toPromise()
      .then((response) => {
        if (response instanceof Blob) {
          return response;
        } else {
          throw new Error('Invalid response type, expected Blob');
        }
      })
      .catch((error) => {
        console.error('Error during file merging:', error);
        throw error;
      });
  }

  trimMergeAudioFiles(fileTrimPairs: { file: File, trims: { start: number, end: number }[] }[]): Promise<Blob> {
    const formData = new FormData();

    fileTrimPairs.forEach((pair) => {
      formData.append('files', pair.file, pair.file.name); // Append the file
    });

    formData.append('fileTrimPairs', JSON.stringify(fileTrimPairs.map(pair => ({
      trims: pair.trims
    })))); // Append the trims data

    return this.http
      .post(this.trimMergeApiUrl, formData, { responseType: 'blob' })
      .toPromise()
      .then((response: Blob | undefined) => {
        if (response instanceof Blob) {
          return response;
        } else {
          throw new Error('Invalid response: Expected Blob');
        }
      })
      .catch((error) => {
        console.error('Error merging audio files:', error);
        throw error; // Re-throw the error to handle it in the component
      });
  }

  audioURL(files:any):Observable<any> {
    return this.http.post(this.audioURLApi,files);
  }

  audioURLPeaks(files:any):Observable<any> {
    return this.http.post(this.audioURLPeaksApi,files);
  }
}
