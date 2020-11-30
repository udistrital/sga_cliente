import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CrudDerechosPecuniariosComponent } from './crud-derechos-pecuniarios.component';

describe('CrudDerechosPecuniariosComponent', () => {
  let component: CrudDerechosPecuniariosComponent;
  let fixture: ComponentFixture<CrudDerechosPecuniariosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CrudDerechosPecuniariosComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CrudDerechosPecuniariosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
