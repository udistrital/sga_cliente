import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogoAsignarPeriodoComponent } from './dialogo-asignar-periodo.component';

describe('DialogoAsignarPeriodoComponent', () => {
  let component: DialogoAsignarPeriodoComponent;
  let fixture: ComponentFixture<DialogoAsignarPeriodoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DialogoAsignarPeriodoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogoAsignarPeriodoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
