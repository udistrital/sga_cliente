/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import { CrudCriterioIcfesComponent } from './crud-criterio_icfes.component';

describe('CrudCriterioIcfesComponent', () => {
  let component: CrudCriterioIcfesComponent;
  let fixture: ComponentFixture<CrudCriterioIcfesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CrudCriterioIcfesComponent],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CrudCriterioIcfesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
