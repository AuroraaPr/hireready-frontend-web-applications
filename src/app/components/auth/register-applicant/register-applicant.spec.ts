import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterApplicant } from './register-applicant';

describe('RegisterApplicant', () => {
  let component: RegisterApplicant;
  let fixture: ComponentFixture<RegisterApplicant>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RegisterApplicant],
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterApplicant);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
