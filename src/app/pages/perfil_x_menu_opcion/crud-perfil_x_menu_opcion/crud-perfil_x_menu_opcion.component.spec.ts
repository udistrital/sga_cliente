/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { CrudPerfilXMenuOpcionComponent } from './crud-perfil_x_menu_opcion.component';

describe('CrudPerfilXMenuOpcionComponent', () => {
  let component: CrudPerfilXMenuOpcionComponent;
  let fixture: ComponentFixture<CrudPerfilXMenuOpcionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CrudPerfilXMenuOpcionComponent ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CrudPerfilXMenuOpcionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
