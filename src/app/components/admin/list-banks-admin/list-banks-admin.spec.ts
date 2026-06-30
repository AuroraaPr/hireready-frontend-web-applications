import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListBanksAdmin } from './list-banks-admin';

describe('ListBanksAdmin', () => {
  let component: ListBanksAdmin;
  let fixture: ComponentFixture<ListBanksAdmin>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ListBanksAdmin],
    }).compileComponents();

    fixture = TestBed.createComponent(ListBanksAdmin);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
