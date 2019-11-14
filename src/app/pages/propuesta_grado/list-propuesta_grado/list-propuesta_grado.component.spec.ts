/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { ListPropuestaGradoComponent } from './list-propuesta_grado.component';

describe('ListPropuestaGradoComponent', () => {
  let component: ListPropuestaGradoComponent;
  let fixture: ComponentFixture<ListPropuestaGradoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ListPropuestaGradoComponent],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ListPropuestaGradoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
