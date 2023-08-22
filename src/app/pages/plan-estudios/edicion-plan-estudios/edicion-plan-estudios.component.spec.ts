import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EdicionPlanEstudiosComponent } from './edicion-plan-estudios.component';

describe('EdicionPlanEstudiosComponent', () => {
  let component: EdicionPlanEstudiosComponent;
  let fixture: ComponentFixture<EdicionPlanEstudiosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EdicionPlanEstudiosComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EdicionPlanEstudiosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
