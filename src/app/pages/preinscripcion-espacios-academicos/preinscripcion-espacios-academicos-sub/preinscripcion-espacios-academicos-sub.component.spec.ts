import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PreinscripcionEspaciosAcademicosComponentSub } from './preinscripcion-espacios-academicos-sub.component';

describe('PreinscripcionEspaciosAcademicosComponent', () => {
  let component: PreinscripcionEspaciosAcademicosComponentSub;
  let fixture: ComponentFixture<PreinscripcionEspaciosAcademicosComponentSub>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PreinscripcionEspaciosAcademicosComponentSub ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PreinscripcionEspaciosAcademicosComponentSub);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
