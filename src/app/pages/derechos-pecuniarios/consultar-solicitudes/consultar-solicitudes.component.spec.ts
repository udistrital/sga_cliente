import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultarSolicitudesDerechosPecuniarios } from './consultar-solicitudes.component';

describe('ConsultarSolicitudesDerechosPecuniarios', () => {
  let component: ConsultarSolicitudesDerechosPecuniarios;
  let fixture: ComponentFixture<ConsultarSolicitudesDerechosPecuniarios>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConsultarSolicitudesDerechosPecuniarios ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConsultarSolicitudesDerechosPecuniarios);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
