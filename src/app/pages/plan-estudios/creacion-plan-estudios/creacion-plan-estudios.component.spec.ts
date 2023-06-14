import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreacionPlanEstudiosComponent } from './creacion-plan-estudios.component';

describe('CreacionPlanEstudiosComponent', () => {
  let component: CreacionPlanEstudiosComponent;
  let fixture: ComponentFixture<CreacionPlanEstudiosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreacionPlanEstudiosComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreacionPlanEstudiosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
