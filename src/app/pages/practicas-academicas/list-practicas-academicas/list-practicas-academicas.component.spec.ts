import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ListPracticasAcademicasComponent } from './list-practicas-academicas.component';

describe('ListPracticasAcademicasComponent', () => {
  let component: ListPracticasAcademicasComponent;
  let fixture: ComponentFixture<ListPracticasAcademicasComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ListPracticasAcademicasComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ListPracticasAcademicasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
