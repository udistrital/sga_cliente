/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import { CrudIcfesComponent } from './crud-icfes.component';

describe('CrudIcfesComponent', () => {
  let component: CrudIcfesComponent;
  let fixture: ComponentFixture<CrudIcfesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CrudIcfesComponent],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CrudIcfesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
