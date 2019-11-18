/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import { CrudInformacionContactoPregradoComponent } from './crud-informacion_contacto_pregrado.component';

describe('CrudInformacionContactoPregradoComponent', () => {
  let component: CrudInformacionContactoPregradoComponent;
  let fixture: ComponentFixture<CrudInformacionContactoPregradoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CrudInformacionContactoPregradoComponent],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CrudInformacionContactoPregradoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
