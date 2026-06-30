import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListCareers } from './list-careers';

describe('ListCareers', () => {
  let component: ListCareers;
  let fixture: ComponentFixture<ListCareers>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ListCareers],
    }).compileComponents();

    fixture = TestBed.createComponent(ListCareers);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
