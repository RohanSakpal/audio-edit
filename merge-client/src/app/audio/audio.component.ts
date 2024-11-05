import { Component } from '@angular/core';
import { AudioService } from '../audio.service';

@Component({
  selector: 'app-audio',
  templateUrl: './audio.component.html',
  styleUrls: ['./audio.component.scss']
})
export class AudioComponent {
  selectedFiles: File[] = [];
  mergedAudioUrl: string | undefined;
  isLoading:boolean = false;

  constructor(private audioMergeService: AudioService) {}

  onFilesSelected(event: any): void {
    this.selectedFiles = Array.from(event.target.files);
  }

  async mergeFiles(): Promise<void> {
    if (this.selectedFiles.length < 2) {
      alert('Please select at least two files');
      return;
    }
    this.isLoading = true;
    try {
      const audioBlob = await this.audioMergeService.mergeAudioFiles(this.selectedFiles);
      this.mergedAudioUrl = URL.createObjectURL(audioBlob); // Create a URL for the audio blob
    } catch (error) {
      console.error('Error merging audio files', error);
    } finally {
      this.isLoading = false;
    }
  }
}
