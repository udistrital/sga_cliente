/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { CrudMenuOpcionPadreComponent } from './crud-menu_opcion_padre.component';

describe('CrudMenuOpcionPadreComponent', () => {
  let component: CrudMenuOpcionPadreComponent;
  let fixture: ComponentFixture<CrudMenuOpcionPadreComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CrudMenuOpcionPadreComponent ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CrudMenuOpcionPadreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
