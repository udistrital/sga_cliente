/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { ListNotificacionConfiguracionPerfilComponent } from './list-notificacion_configuracion_perfil.component';

describe('ListNotificacionConfiguracionPerfilComponent', () => {
  let component: ListNotificacionConfiguracionPerfilComponent;
  let fixture: ComponentFixture<ListNotificacionConfiguracionPerfilComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ListNotificacionConfiguracionPerfilComponent ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ListNotificacionConfiguracionPerfilComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
