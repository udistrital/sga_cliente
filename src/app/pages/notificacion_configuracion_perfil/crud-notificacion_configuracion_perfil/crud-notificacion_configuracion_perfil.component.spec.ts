/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { CrudNotificacionConfiguracionPerfilComponent } from './crud-notificacion_configuracion_perfil.component';

describe('CrudNotificacionConfiguracionPerfilComponent', () => {
  let component: CrudNotificacionConfiguracionPerfilComponent;
  let fixture: ComponentFixture<CrudNotificacionConfiguracionPerfilComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CrudNotificacionConfiguracionPerfilComponent ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CrudNotificacionConfiguracionPerfilComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
