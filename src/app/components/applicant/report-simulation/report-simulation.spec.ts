import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportSimulation } from './report-simulation';

describe('ReportSimulation', () => {
  let component: ReportSimulation;
  let fixture: ComponentFixture<ReportSimulation>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ReportSimulation],
    }).compileComponents();

    fixture = TestBed.createComponent(ReportSimulation);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
