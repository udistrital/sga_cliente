/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { CrudNotificacionConfiguracionComponent } from './crud-notificacion_configuracion.component';

describe('CrudNotificacionConfiguracionComponent', () => {
  let component: CrudNotificacionConfiguracionComponent;
  let fixture: ComponentFixture<CrudNotificacionConfiguracionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CrudNotificacionConfiguracionComponent ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CrudNotificacionConfiguracionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
