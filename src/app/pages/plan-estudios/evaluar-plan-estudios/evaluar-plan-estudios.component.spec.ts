import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EvaluarPlanEstudiosComponent } from './evaluar-plan-estudios.component';

describe('EvaluarPlanEstudiosComponent', () => {
  let component: EvaluarPlanEstudiosComponent;
  let fixture: ComponentFixture<EvaluarPlanEstudiosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EvaluarPlanEstudiosComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EvaluarPlanEstudiosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
