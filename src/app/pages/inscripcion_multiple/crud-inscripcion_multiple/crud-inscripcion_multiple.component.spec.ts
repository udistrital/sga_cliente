/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import { CrudInscripcionMultipleComponent } from './crud-inscripcion_multiple.component';

describe('CrudInscripcionMultipleComponent', () => {
  let component: CrudInscripcionMultipleComponent;
  let fixture: ComponentFixture<CrudInscripcionMultipleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CrudInscripcionMultipleComponent],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CrudInscripcionMultipleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
