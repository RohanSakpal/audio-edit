import { ChangeDetectorRef, Component } from '@angular/core';

@Component({
  selector: 'app-old-method',
  templateUrl: './old-method.component.html',
  styleUrls: ['./old-method.component.scss']
})
export class OldMethodComponent {
  files: File[] = [];
  startPoint:number = 0;
  endPoint!:number;
  startValue:number = 0;
  endValue!:number;

  constructor(private cdr: ChangeDetectorRef) {}

  onFilesSelected(event: Event): void {
    this.files = [];
    const fileList = (event.target as HTMLInputElement).files;
    if (fileList) {
      this.files = Array.from(fileList);
    }
  }

  editAudio(index: any) {
    const audio = new Audio();
    const url = URL.createObjectURL(this.files[index]);
    audio.src = url;

    audio.onloadedmetadata = () => {
      debugger
      this.startPoint = 0;
      this.startValue = 0;
      this.endPoint = Math.floor(audio.duration);
      this.endValue = Math.floor(audio.duration)
      this.cdr.detectChanges();
      URL.revokeObjectURL(url);
    };
  }
}
