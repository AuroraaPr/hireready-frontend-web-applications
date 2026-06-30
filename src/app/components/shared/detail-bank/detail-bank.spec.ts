import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailBank } from './detail-bank';

describe('DetailBank', () => {
  let component: DetailBank;
  let fixture: ComponentFixture<DetailBank>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DetailBank],
    }).compileComponents();

    fixture = TestBed.createComponent(DetailBank);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
