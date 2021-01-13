import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ListSolicitudesEstudianteComponent } from './list-solicitudes-estudiante.component';

describe('ListSolicitudesEstudianteComponent', () => {
  let component: ListSolicitudesEstudianteComponent;
  let fixture: ComponentFixture<ListSolicitudesEstudianteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ListSolicitudesEstudianteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ListSolicitudesEstudianteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
