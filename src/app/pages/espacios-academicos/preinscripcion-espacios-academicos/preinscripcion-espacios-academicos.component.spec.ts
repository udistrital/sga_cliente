import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PreinscripcionEspaciosAcademicosComponent } from './preinscripcion-espacios-academicos.component';

describe('PreinscripcionEspaciosAcademicosComponent', () => {
  let component: PreinscripcionEspaciosAcademicosComponent;
  let fixture: ComponentFixture<PreinscripcionEspaciosAcademicosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PreinscripcionEspaciosAcademicosComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PreinscripcionEspaciosAcademicosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
