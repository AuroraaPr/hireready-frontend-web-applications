import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SaveProfileApplicant } from './save-profile-applicant';

describe('SaveProfileApplicant', () => {
  let component: SaveProfileApplicant;
  let fixture: ComponentFixture<SaveProfileApplicant>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SaveProfileApplicant],
    }).compileComponents();

    fixture = TestBed.createComponent(SaveProfileApplicant);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
