import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListApplicants } from './list-applicants';

describe('ListApplicants', () => {
  let component: ListApplicants;
  let fixture: ComponentFixture<ListApplicants>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ListApplicants],
    }).compileComponents();

    fixture = TestBed.createComponent(ListApplicants);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
