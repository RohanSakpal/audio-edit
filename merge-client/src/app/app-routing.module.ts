import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AudioComponent } from './audio/audio.component';
import { TrimMergeComponent } from './trim-merge/trim-merge.component';
import { WaveTrimComponent } from './wave-trim/wave-trim.component';
import { AudioLinkComponent } from './audio-link/audio-link.component';
import { OldMethodComponent } from './old-method/old-method.component';

const routes: Routes = [
  {path:'',redirectTo:'audio-link',pathMatch:'full'},
  {path:'merge',component:AudioComponent},
  {path:'trim-merge',component:TrimMergeComponent},
  {path:'wave-trim',component:WaveTrimComponent},
  {path:'audio-link',component:AudioLinkComponent},
  {path:'old-method',component:OldMethodComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
