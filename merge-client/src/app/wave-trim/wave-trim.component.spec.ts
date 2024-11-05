import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WaveTrimComponent } from './wave-trim.component';

describe('WaveTrimComponent', () => {
  let component: WaveTrimComponent;
  let fixture: ComponentFixture<WaveTrimComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [WaveTrimComponent]
    });
    fixture = TestBed.createComponent(WaveTrimComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
