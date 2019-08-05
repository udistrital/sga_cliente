/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { CrudParametroComponent } from './crud-parametro.component';

describe('CrudParametroComponent', () => {
  let component: CrudParametroComponent;
  let fixture: ComponentFixture<CrudParametroComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CrudParametroComponent ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CrudParametroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
