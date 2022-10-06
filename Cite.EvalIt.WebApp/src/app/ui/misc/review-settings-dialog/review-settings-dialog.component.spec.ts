import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReviewSettingsDialogComponent } from './review-settings-dialog.component';

describe('ReviewSettingsDialogComponent', () => {
  let component: ReviewSettingsDialogComponent;
  let fixture: ComponentFixture<ReviewSettingsDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReviewSettingsDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReviewSettingsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
