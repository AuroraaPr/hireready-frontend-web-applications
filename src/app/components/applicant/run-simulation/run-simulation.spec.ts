import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RunSimulation } from './run-simulation';

describe('RunSimulation', () => {
  let component: RunSimulation;
  let fixture: ComponentFixture<RunSimulation>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RunSimulation],
    }).compileComponents();

    fixture = TestBed.createComponent(RunSimulation);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
