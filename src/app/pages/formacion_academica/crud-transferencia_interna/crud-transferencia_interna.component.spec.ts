/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import { CrudTransferenciaInternaComponent } from './crud-transferencia_interna.component';

describe('CrudTransferenciaInternaComponent', () => {
  let component: CrudTransferenciaInternaComponent;
  let fixture: ComponentFixture<CrudTransferenciaInternaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CrudTransferenciaInternaComponent],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CrudTransferenciaInternaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
