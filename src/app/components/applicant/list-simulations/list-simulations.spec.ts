import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListSimulations } from './list-simulations';

describe('ListSimulations', () => {
  let component: ListSimulations;
  let fixture: ComponentFixture<ListSimulations>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ListSimulations],
    }).compileComponents();

    fixture = TestBed.createComponent(ListSimulations);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
