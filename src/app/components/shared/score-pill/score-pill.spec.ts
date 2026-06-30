import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScorePill } from './score-pill';

describe('ScorePill', () => {
  let component: ScorePill;
  let fixture: ComponentFixture<ScorePill>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ScorePill],
    }).compileComponents();

    fixture = TestBed.createComponent(ScorePill);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
