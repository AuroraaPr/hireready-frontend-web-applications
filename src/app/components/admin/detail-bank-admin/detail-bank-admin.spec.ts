import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailBankAdmin } from './detail-bank-admin';

describe('DetailBankAdmin', () => {
  let component: DetailBankAdmin;
  let fixture: ComponentFixture<DetailBankAdmin>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DetailBankAdmin],
    }).compileComponents();

    fixture = TestBed.createComponent(DetailBankAdmin);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
