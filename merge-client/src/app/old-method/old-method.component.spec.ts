import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OldMethodComponent } from './old-method.component';

describe('OldMethodComponent', () => {
  let component: OldMethodComponent;
  let fixture: ComponentFixture<OldMethodComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [OldMethodComponent]
    });
    fixture = TestBed.createComponent(OldMethodComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
