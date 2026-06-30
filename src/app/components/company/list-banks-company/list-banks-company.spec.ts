import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListBanksCompany } from './list-banks-company';

describe('ListBanksCompany', () => {
  let component: ListBanksCompany;
  let fixture: ComponentFixture<ListBanksCompany>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ListBanksCompany],
    }).compileComponents();

    fixture = TestBed.createComponent(ListBanksCompany);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
