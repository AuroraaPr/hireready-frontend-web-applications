import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListCompanies } from './list-companies';

describe('ListCompanies', () => {
  let component: ListCompanies;
  let fixture: ComponentFixture<ListCompanies>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ListCompanies],
    }).compileComponents();

    fixture = TestBed.createComponent(ListCompanies);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
