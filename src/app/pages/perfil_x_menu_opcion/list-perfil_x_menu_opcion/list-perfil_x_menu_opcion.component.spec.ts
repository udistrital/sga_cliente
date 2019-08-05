/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { ListPerfilXMenuOpcionComponent } from './list-perfil_x_menu_opcion.component';

describe('ListPerfilXMenuOpcionComponent', () => {
  let component: ListPerfilXMenuOpcionComponent;
  let fixture: ComponentFixture<ListPerfilXMenuOpcionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ListPerfilXMenuOpcionComponent ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ListPerfilXMenuOpcionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
