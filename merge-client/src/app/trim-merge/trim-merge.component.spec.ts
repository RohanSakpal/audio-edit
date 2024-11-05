import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrimMergeComponent } from './trim-merge.component';

describe('TrimMergeComponent', () => {
  let component: TrimMergeComponent;
  let fixture: ComponentFixture<TrimMergeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TrimMergeComponent]
    });
    fixture = TestBed.createComponent(TrimMergeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
