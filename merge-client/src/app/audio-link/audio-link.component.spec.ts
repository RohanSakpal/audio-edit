import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AudioLinkComponent } from './audio-link.component';

describe('AudioLinkComponent', () => {
  let component: AudioLinkComponent;
  let fixture: ComponentFixture<AudioLinkComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AudioLinkComponent]
    });
    fixture = TestBed.createComponent(AudioLinkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
