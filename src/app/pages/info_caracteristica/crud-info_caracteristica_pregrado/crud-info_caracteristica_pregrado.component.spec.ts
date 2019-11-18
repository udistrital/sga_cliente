/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import { CrudInfoCaracteristicaPregradoComponent } from './crud-info_caracteristica_pregrado.component';

describe('CrudInfoCaracteristicaPregradoComponent', () => {
  let component: CrudInfoCaracteristicaPregradoComponent;
  let fixture: ComponentFixture<CrudInfoCaracteristicaPregradoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CrudInfoCaracteristicaPregradoComponent],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CrudInfoCaracteristicaPregradoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
