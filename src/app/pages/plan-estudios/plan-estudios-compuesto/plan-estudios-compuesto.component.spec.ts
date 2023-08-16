import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PlanEstudiosCompuestoComponent } from './plan-estudios-compuesto.component';

describe('PlanEstudiosCompuestoComponent', () => {
  let component: PlanEstudiosCompuestoComponent;
  let fixture: ComponentFixture<PlanEstudiosCompuestoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PlanEstudiosCompuestoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlanEstudiosCompuestoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
