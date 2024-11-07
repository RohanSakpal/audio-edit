import { ChangeDetectorRef, Component, ElementRef, QueryList, ViewChildren } from '@angular/core';
import WaveSurfer from 'wavesurfer.js';
import RegionsPlugin from 'wavesurfer.js/dist/plugins/regions';
import { AudioService } from '../audio.service';
import Hover from 'wavesurfer.js/dist/plugins/hover';

interface AudioFile {
  wavesurfer: WaveSurfer;
  isPlaying: boolean;
  name: string;
  file: File;
  url: string;
}

@Component({
  selector: 'app-audio-link',
  templateUrl: './audio-link.component.html',
  styleUrls: ['./audio-link.component.scss']
})
export class AudioLinkComponent {
  @ViewChildren('waveform') waveformElements!: QueryList<ElementRef>;  // Access waveform divs
  audioFiles: AudioFile[] = [];
  currentPlayingIndex: number | null = null;
  regions: any[] = [];
  activeRegion: any = null;
  loop: boolean = false;
  mergedAudioUrl: string | null = null;
  isLoading = false;
  trimData: { start: number, end: number }[][] = [];
  files: File[] = []
  url: any[] = [];
  msg: string = 'Merging files, please wait...';
  hovers: any[] = [];

  constructor(private cdr: ChangeDetectorRef, private audioMergeService: AudioService) { }

  onFilesSelected(event: Event): void {
    this.isLoading = true;
    this.msg = 'Wave will Created, Please wait....';
    this.files = [];

    const fileList = (event.target as HTMLInputElement).files;
    if (fileList) {
      this.files = Array.from(fileList);

      const formData = new FormData();
      this.files.forEach((file: File) => formData.append('files', file, file.name));

      this.audioMergeService.audioURLPeaks(formData).subscribe((res: any) => {
        this.url = res.files;
        this.createWave();
      }, (err: any) => {
        this.isLoading = false;
      })
    }
  }

  urlToFile(url: string): Promise<File> {
    return fetch(url)
      .then(response => response.blob())
      .then(blob => {
        const name = url.split('/').pop() || 'file';
        return new File([blob], name, { type: blob.type });
      });
  }

  // createWave() {
  //   // this.audioFiles.forEach(fileObj => {
  //   //   if (fileObj.wavesurfer) {
  //   //     fileObj.wavesurfer.destroy();
  //   //     fileObj.wavesurfer = null as any;
  //   //   }
  //   // });
  //   this.audioFiles = [];
  //   debugger
  //   this.url.forEach((filep, index) => {
  //     this.regions.push(RegionsPlugin.create());
  //     this.urlToFile(filep.fileUrl).then((fileRes) => {
  //       this.audioFiles.push({ 
  //         wavesurfer: null!, 
  //         isPlaying: false,
  //         name: filep.fileName,
  //         file: fileRes,
  //         url: filep.fileUrl,
  //       });

  //       this.trimData.push([]);
  //       this.cdr.detectChanges();
  //       const waveformElement = this.waveformElements.toArray()[index].nativeElement;
  //       const wavesurfer = WaveSurfer.create({
  //         container: waveformElement,
  //         waveColor: 'violet',
  //         progressColor: 'purple',
  //         backend: 'MediaElement',
  //         plugins: [this.regions[index]],
  //         height: 50,
  //         url: filep.fileUrl,
  //         peaks: filep.peaks
  //       });

  //       wavesurfer.on('decode', () => {
  //         this.regions[index].enableDragSelection({
  //           color: 'rgba(255, 0, 0, 0.1)',
  //         });

  //         this.regions[index].on('region-updated', (region: any) => {
  //           const newArray = this.regions[index].getRegions().map(({ start, end }: any) => ({ start, end }));
  //           this.trimData[index] = newArray;
  //         });

  //         this.regions[index].on('region-in', (region: any) => {
  //           this.activeRegion = region;
  //         });

  //         this.regions[index].on('region-created', (region: any) => {
  //           const newArray = this.regions[index].getRegions().map(({ start, end }: any) => ({ start, end }));
  //           this.trimData[index] = newArray;
  //         });

  //         this.regions[index].on('region-out', (region: any) => {
  //           if (this.activeRegion === region) {
  //             if (this.loop) {
  //               region.play();
  //             } else {
  //               this.activeRegion = null;
  //             }
  //           }
  //         });

  //         this.regions[index].on('region-clicked', (region: any, e: any) => {
  //           e.stopPropagation();
  //           this.pauseAllOtherRegionsAndAudios(index);
  //           this.activeRegion = region;
  //           region.play();
  //         });
  //       });

  //       // Assign wavesurfer instance to the current audio file
  //       this.audioFiles[index].wavesurfer = wavesurfer;
  //     }).catch((error) => {
  //       console.error("Error converting URL to File:", error);
  //     });
  //   });
  // }

  async createWave() {
    if (!this.url || this.url.length === 0) {
      console.error("URL array is empty or undefined.");
      return;
    }

    this.audioFiles = [];
    this.trimData = [];

    for (const [index, filep] of this.url.entries()) {
      this.regions.push(RegionsPlugin.create());
      const hoverPlugin = Hover.create({
        lineColor: '#ff0000',
        lineWidth: 2,
        labelBackground: '#555',
        labelColor: '#fff',
        labelSize: '11px',
      });
      this.hovers.push(hoverPlugin);

      try {
        const fileRes = await this.urlToFile(filep.fileUrl);
        this.audioFiles.push({
          wavesurfer: null!,
          isPlaying: false,
          name: filep.fileName,
          file: fileRes,
          url: filep.fileUrl,
        });

        this.trimData.push([]);
        this.cdr.detectChanges();

        const waveformElement = this.waveformElements.toArray()[index]?.nativeElement;
        if (!waveformElement) {
          console.error(`Waveform element not found at index ${index}`);
          continue;
        }

        const wavesurfer = WaveSurfer.create({
          container: waveformElement,
          waveColor: 'violet',
          progressColor: 'purple',
          backend: 'MediaElement',
          plugins: [this.regions[index], this.hovers[index]],
          height: 50,
          url: filep.fileUrl,
          peaks: filep.peaks
        });

        wavesurfer.on('decode', () => {
          this.regions[index].enableDragSelection({
            color: 'rgba(255, 0, 0, 0.1)',
          });

          this.regions[index].on('region-updated', (region: any) => {
            const newArray = this.regions[index].getRegions().map(({ start, end }: any) => ({ start, end }));
            this.trimData[index] = newArray;
          });

          this.regions[index].on('region-in', (region: any) => {
            this.activeRegion = region;
          });

          this.regions[index].on('region-created', (region: any) => {
            const newArray = this.regions[index].getRegions().map(({ start, end }: any) => ({ start, end }));
            this.trimData[index] = newArray;
          });

          this.regions[index].on('region-out', (region: any) => {
            if (this.activeRegion === region) {
              if (this.loop) {
                region.play();
              } else {
                this.activeRegion = null;
              }
            }
          });

          this.regions[index].on('region-clicked', (region: any, e: any) => {
            e.stopPropagation();
            this.pauseAllOtherRegionsAndAudios(index);
            this.activeRegion = region;
            region.play();
          });
        });
        this.audioFiles[index].wavesurfer = wavesurfer;
      } catch (error) {
        console.error("Error converting URL to File:", error);
      }
    }
    this.isLoading = false;
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

    if (this.currentPlayingIndex !== null && this.currentPlayingIndex !== index) {
      const currentlyPlayingFile = this.audioFiles[this.currentPlayingIndex];
      currentlyPlayingFile.wavesurfer.pause();
      currentlyPlayingFile.isPlaying = false;

      const prevButton = document.querySelector(`[data-index="${this.currentPlayingIndex}"]`) as HTMLElement;
      if (prevButton) {
        prevButton.textContent = 'Play';
      }
    }

    if (audioFile.isPlaying) {
      audioFile.wavesurfer.pause();
      button.textContent = 'Play';
    } else {
      audioFile.wavesurfer.play();
      button.textContent = 'Pause';
      this.currentPlayingIndex = index;
    }

    audioFile.isPlaying = !audioFile.isPlaying;
  }

  async mergeFiles(): Promise<void> {
    this.msg = 'Merging files, please wait...';
    if (this.audioFiles.length === 0) {
      alert('Please select at least two files.');
      return;
    }

    this.isLoading = true;

    const fileTrimPairs: any = this.audioFiles.map((file, index) => ({
      file: file.file,
      trims: this.trimData[index],
    }));
    try {
      const mergedBlob = await this.audioMergeService.trimMergeAudioFiles(fileTrimPairs);
      this.mergedAudioUrl = URL.createObjectURL(mergedBlob);
      this.createFileFormate(mergedBlob)
    } catch (error) {
      alert('There was an issue merging the audio files.');
    } finally {
      this.isLoading = false;
    }
  }

  createFileFormate(mergedBlob: Blob) {
    const mergedFile = new File([mergedBlob], 'merged-audio.mp3', { type: 'audio/mpeg' });
  }
}
