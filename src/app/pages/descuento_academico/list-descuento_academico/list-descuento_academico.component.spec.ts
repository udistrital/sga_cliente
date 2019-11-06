/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import { ListDescuentoAcademicoComponent } from './list-descuento_academico.component';

describe('ListDescuentoAcademicoComponent', () => {
  let component: ListDescuentoAcademicoComponent;
  let fixture: ComponentFixture<ListDescuentoAcademicoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ListDescuentoAcademicoComponent],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ListDescuentoAcademicoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
