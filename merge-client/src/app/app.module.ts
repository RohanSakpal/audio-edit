import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AudioComponent } from './audio/audio.component';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TrimMergeComponent } from './trim-merge/trim-merge.component';
import { WaveTrimComponent } from './wave-trim/wave-trim.component';
import { CommonModule } from '@angular/common';
import { AudioLinkComponent } from './audio-link/audio-link.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { OldMethodComponent } from './old-method/old-method.component';
import {MatSliderModule} from '@angular/material/slider';

@NgModule({
  declarations: [
    AppComponent,
    AudioComponent,
    TrimMergeComponent,
    WaveTrimComponent,
    AudioLinkComponent,
    OldMethodComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    CommonModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    MatSliderModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
