/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { ListCalendarioeventoComponent } from './list-calendarioevento.component';

describe('ListCalendarioeventoComponent', () => {
  let component: ListCalendarioeventoComponent;
  let fixture: ComponentFixture<ListCalendarioeventoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ListCalendarioeventoComponent ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ListCalendarioeventoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
