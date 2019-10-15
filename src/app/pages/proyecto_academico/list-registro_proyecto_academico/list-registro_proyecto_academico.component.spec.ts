/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { ListRegistroProyectoAcademicoComponent } from './list-registro_proyecto_academico.component';

describe('ListProduccionAcademicaComponent', () => {
  let component: ListRegistroProyectoAcademicoComponent;
  let fixture: ComponentFixture<ListRegistroProyectoAcademicoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ListRegistroProyectoAcademicoComponent ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ListRegistroProyectoAcademicoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
