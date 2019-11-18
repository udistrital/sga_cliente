/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import { CrudIcfesExternoComponent } from './crud-icfes_externo.component';

describe('CrudIcfesExternoComponent', () => {
  let component: CrudIcfesExternoComponent;
  let fixture: ComponentFixture<CrudIcfesExternoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CrudIcfesExternoComponent],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CrudIcfesExternoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
