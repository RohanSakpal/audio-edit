import { ChangeDetectorRef, Component, ElementRef, QueryList, Renderer2, ViewChild, ViewChildren } from '@angular/core';
import WaveSurfer from 'wavesurfer.js';
import RegionsPlugin from 'wavesurfer.js/dist/plugins/regions';
import { AudioService } from '../audio.service';

interface AudioFile {
  wavesurfer: WaveSurfer;
  isPlaying: boolean;
  name:string;
  file:File;
}

@Component({
  selector: 'app-wave-trim',
  templateUrl: './wave-trim.component.html',
  styleUrls: ['./wave-trim.component.scss']
})
export class WaveTrimComponent {
  @ViewChildren('waveform') waveformElements!: QueryList<ElementRef>;  // Access waveform divs
  audioFiles: AudioFile[] = [];
  currentPlayingIndex: number | null = null;
  regions:any[] = [];
  activeRegion: any = null;
  loop: boolean = false;
  mergedAudioUrl: string | null = null;
  isLoading = false;
  trimData: { start: number, end: number }[][] = [];

  constructor(private cdr: ChangeDetectorRef,private audioMergeService:AudioService) {}

  onFilesSelected(event: Event): void {
    const files = (event.target as HTMLInputElement).files;
    if (files) {
      Array.from(files).forEach((file, index) => {
        this.regions.push(RegionsPlugin.create())
        // Add audio file to the list first (Angular needs to process it in the DOM)
        this.audioFiles.push({ wavesurfer: null!, isPlaying: false,name: file.name, file:file });
        this.trimData.push([]);

        // Use ChangeDetectorRef to ensure the view is updated before accessing the DOM
        this.cdr.detectChanges();

        // Initialize WaveSurfer after the DOM is updated
        const waveformElement = this.waveformElements.toArray()[index].nativeElement;

        const wavesurfer = WaveSurfer.create({
          container: waveformElement, // Access the specific waveform div
          waveColor: 'violet',
          progressColor: 'purple',
          backend: 'MediaElement',
          plugins: [this.regions[index]],
          height: 50
        });

        wavesurfer.on('decode', () => {
          this.regions[index].enableDragSelection({
            color: 'rgba(255, 0, 0, 0.1)',
          });

          this.regions[index].on('region-updated', (region:any) => {
            console.log('Updated region', region);
            const newArray = this.regions[index].getRegions().map(({ start, end }:any) => ({ start, end }));
            this.trimData[index] = newArray;
            console.log('trim',this.trimData)
          });

          this.regions[index].on('region-in', (region:any) => {
            this.activeRegion = region;
          });

          this.regions[index].on('region-created', (region:any) => {
            const newArray = this.regions[index].getRegions().map(({ start, end }:any) => ({ start, end }));
            this.trimData[index] = newArray;
            console.log('trim',this.trimData)
          });

          this.regions[index].on('region-out', (region:any) => {
            if (this.activeRegion === region) {
              if (this.loop) {
                region.play();
              } else {
                this.activeRegion = null;
              }
            }
          });

          this.regions[index].on('region-clicked', (region:any, e:any) => {
            e.stopPropagation(); // prevent triggering a click on the waveform
            this.pauseAllOtherRegionsAndAudios(index);
            this.activeRegion = region;
            region.play();
          });
        });

        const fileURL = URL.createObjectURL(file);
        wavesurfer.load(fileURL);

        // Update the audioFile object with the initialized WaveSurfer instance
        this.audioFiles[index].wavesurfer = wavesurfer;
      });
    }
  }

  pauseAllOtherRegionsAndAudios(currentIndex: number): void {
    this.audioFiles.forEach((audioFile, index) => {
      if (index !== currentIndex) {
        if (audioFile.isPlaying) {
          audioFile.wavesurfer.pause();
          audioFile.isPlaying = false;
        }
 
        const regions = this.regions[index].getRegions() as { [key: string]: any };

        Object.keys(regions).forEach((regionId: string) => {
          const region = regions[regionId];
          if (region) {
            audioFile.wavesurfer.pause();
          }
        });
      }
    });
  }
  
  
  togglePlayPause(index: number, button: HTMLElement): void {
    const audioFile = this.audioFiles[index];
  
    // If there's currently a playing audio, pause it and update its button text
    if (this.currentPlayingIndex !== null && this.currentPlayingIndex !== index) {
      const currentlyPlayingFile = this.audioFiles[this.currentPlayingIndex];
      currentlyPlayingFile.wavesurfer.pause();
      currentlyPlayingFile.isPlaying = false;
  
      // Update the button of the previously playing audio to show 'Play'
      const prevButton = document.querySelector(`[data-index="${this.currentPlayingIndex}"]`) as HTMLElement;
      if (prevButton) {
        prevButton.textContent = 'Play';  // Update the text of the previous button
      }
    }
  
    // Toggle play/pause for the clicked audio
    if (audioFile.isPlaying) {
      audioFile.wavesurfer.pause();
      button.textContent = 'Play';  // Update the button text when pausing
    } else {
      audioFile.wavesurfer.play();
      button.textContent = 'Pause';  // Update the button text when playing
      this.currentPlayingIndex = index;  // Update the currently playing audio index
    }
  
    audioFile.isPlaying = !audioFile.isPlaying;  // Toggle the playing state
  }

  async mergeFiles(): Promise<void> {
    debugger
    if (this.audioFiles.length === 0) {
      alert('Please select at least two files.');
      return;
    }

    this.isLoading = true;

    const fileTrimPairs:any = this.audioFiles.map((file, index) => ({
      file: file.file,
      trims: this.trimData[index], 
    }));
    console.log('filezTrimPair',fileTrimPairs)
    try {
      const mergedBlob = await this.audioMergeService.trimMergeAudioFiles(fileTrimPairs);
      this.mergedAudioUrl = URL.createObjectURL(mergedBlob); 
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
