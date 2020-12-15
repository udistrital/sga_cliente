import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultarConceptosComponent } from './consultar-conceptos.component';

describe('ConsultarConceptosComponent', () => {
  let component: ConsultarConceptosComponent;
  let fixture: ComponentFixture<ConsultarConceptosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConsultarConceptosComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConsultarConceptosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
