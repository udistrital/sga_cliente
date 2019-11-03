/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { ListArchivoIcfesComponent } from './list-archivo_icfes.component';

describe('ListArchivoIcfesComponent', () => {
  let component: ListArchivoIcfesComponent;
  let fixture: ComponentFixture<ListArchivoIcfesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ListArchivoIcfesComponent ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ListArchivoIcfesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
