/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { ListNotificacionEstadoUsuarioComponent } from './list-notificacion_estado_usuario.component';

describe('ListNotificacionEstadoUsuarioComponent', () => {
  let component: ListNotificacionEstadoUsuarioComponent;
  let fixture: ComponentFixture<ListNotificacionEstadoUsuarioComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ListNotificacionEstadoUsuarioComponent ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ListNotificacionEstadoUsuarioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
