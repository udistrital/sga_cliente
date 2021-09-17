import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GeneracionRecibosDerechosPecuniarios } from './generacion-recibos-derechos-pecuniarios.component';

describe('GeneracionRecibosDerechosPecuniarios', () => {
  let component: GeneracionRecibosDerechosPecuniarios;
  let fixture: ComponentFixture<GeneracionRecibosDerechosPecuniarios>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GeneracionRecibosDerechosPecuniarios ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GeneracionRecibosDerechosPecuniarios);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
