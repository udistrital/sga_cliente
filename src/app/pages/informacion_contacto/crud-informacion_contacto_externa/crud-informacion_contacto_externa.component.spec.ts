/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import { CrudInformacionContactoExternaComponent } from './crud-informacion_contacto_externa.component';

describe('CrudInformacionContactoExternaComponent', () => {
  let component: CrudInformacionContactoExternaComponent;
  let fixture: ComponentFixture<CrudInformacionContactoExternaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CrudInformacionContactoExternaComponent],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CrudInformacionContactoExternaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
