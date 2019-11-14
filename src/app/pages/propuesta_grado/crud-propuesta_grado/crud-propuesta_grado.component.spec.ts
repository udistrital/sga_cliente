/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { CrudPropuestaGradoComponent } from './crud-propuesta_grado.component';

describe('CrudPropuestaGradoComponent', () => {
  let component: CrudPropuestaGradoComponent;
  let fixture: ComponentFixture<CrudPropuestaGradoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CrudPropuestaGradoComponent],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CrudPropuestaGradoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
