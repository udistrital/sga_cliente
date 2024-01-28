import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CrudModalidadComponent } from './crud-modalidad.component';

describe('CrudModalidadComponent', () => {
  let component: CrudModalidadComponent;
  let fixture: ComponentFixture<CrudModalidadComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CrudModalidadComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CrudModalidadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
