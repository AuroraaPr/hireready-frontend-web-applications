import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SaveBankCompany } from './save-bank-company';

describe('SaveBankCompany', () => {
  let component: SaveBankCompany;
  let fixture: ComponentFixture<SaveBankCompany>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SaveBankCompany],
    }).compileComponents();

    fixture = TestBed.createComponent(SaveBankCompany);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
