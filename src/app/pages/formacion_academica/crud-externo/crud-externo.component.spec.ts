/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import { CrudExternoComponent } from './crud-externo.component';

describe('CrudExternoComponent', () => {
  let component: CrudExternoComponent;
  let fixture: ComponentFixture<CrudExternoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CrudExternoComponent],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CrudExternoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
