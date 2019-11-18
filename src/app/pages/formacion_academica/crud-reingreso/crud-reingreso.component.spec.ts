/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import { CrudReingresoComponent } from './crud-reingreso.component';

describe('CrudReingresoComponent', () => {
  let component: CrudReingresoComponent;
  let fixture: ComponentFixture<CrudReingresoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CrudReingresoComponent],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CrudReingresoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
