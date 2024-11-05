import { Component } from '@angular/core';
import { AudioService } from '../audio.service';

@Component({
  selector: 'app-trim-merge',
  templateUrl: './trim-merge.component.html',
  styleUrls: ['./trim-merge.component.scss']
})
export class TrimMergeComponent {
  selectedFiles: File[] = [];
  trimData: { start: number, end: number }[][] = []; // Array of trim ranges for each file
  trimStart: number[] = []; // Model for the start time input
  trimEnd: number[] = [];   // Model for the end time input
  mergedAudioUrl: string | null = null;
  isLoading = false;

  constructor(private audioMergeService: AudioService) {}

  onFilesSelected(event: any): void {
    this.selectedFiles = Array.from(event.target.files);
    this.trimData = this.selectedFiles.map(() => []); // Initialize trim data for each file
  }

  // No need to pass values from template, as they're bound to trimStart and trimEnd models
  setTrimData(fileIndex: number): void {
    const startTime = this.trimStart[fileIndex];
    const endTime = this.trimEnd[fileIndex];

    if (isNaN(startTime) || isNaN(endTime)) {
      alert('Please enter valid numeric values for start and end times.');
      return;
    }

    this.trimData[fileIndex].push({ start: startTime, end: endTime });
    console.log(this.trimData);
  }

  async mergeFiles(): Promise<void> {
    if (this.selectedFiles.length === 0) {
      alert('Please select at least two files.');
      return;
    }

    this.isLoading = true;

    const fileTrimPairs = this.selectedFiles.map((file, index) => ({
      file,
      trims: this.trimData[index], // Pass the trim data for each file
    }));

    try {
      const mergedBlob = await this.audioMergeService.trimMergeAudioFiles(fileTrimPairs);
      this.mergedAudioUrl = URL.createObjectURL(mergedBlob); // Create URL for audio
      this.createFileFormate(mergedBlob)
    } catch (error) {
      console.error('Error merging files:', error);
      alert('There was an issue merging the audio files.');
    } finally {
      this.isLoading = false;
    }
  }

  createFileFormate(mergedBlob:Blob) {
    const mergedFile = new File([mergedBlob], 'merged-audio.mp3', { type: 'audio/mpeg' });
    console.log(mergedFile)
  }
}
