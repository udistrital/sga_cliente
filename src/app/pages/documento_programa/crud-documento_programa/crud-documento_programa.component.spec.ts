/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import { CrudDocumentoProgramaComponent } from './crud-documento_programa.component';

describe('CrudDocumentoProgramaComponent', () => {
  let component: CrudDocumentoProgramaComponent;
  let fixture: ComponentFixture<CrudDocumentoProgramaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CrudDocumentoProgramaComponent],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CrudDocumentoProgramaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
