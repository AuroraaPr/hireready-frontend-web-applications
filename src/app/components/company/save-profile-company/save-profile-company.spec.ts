import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SaveProfileCompany } from './save-profile-company';

describe('SaveProfileCompany', () => {
  let component: SaveProfileCompany;
  let fixture: ComponentFixture<SaveProfileCompany>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SaveProfileCompany],
    }).compileComponents();

    fixture = TestBed.createComponent(SaveProfileCompany);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
