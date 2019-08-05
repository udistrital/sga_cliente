/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { CrudNotificacionEstadoUsuarioComponent } from './crud-notificacion_estado_usuario.component';

describe('CrudNotificacionEstadoUsuarioComponent', () => {
  let component: CrudNotificacionEstadoUsuarioComponent;
  let fixture: ComponentFixture<CrudNotificacionEstadoUsuarioComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CrudNotificacionEstadoUsuarioComponent ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CrudNotificacionEstadoUsuarioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
