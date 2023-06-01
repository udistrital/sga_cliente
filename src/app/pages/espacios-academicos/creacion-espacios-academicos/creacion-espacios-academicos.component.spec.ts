import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreacionEspaciosAcademicosComponent } from './creacion-espacios-academicos.component';

describe('CreacionEspaciosAcademicosComponent', () => {
  let component: CreacionEspaciosAcademicosComponent;
  let fixture: ComponentFixture<CreacionEspaciosAcademicosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreacionEspaciosAcademicosComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreacionEspaciosAcademicosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
