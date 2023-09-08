import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionHorarioComponent } from './gestion-horario.component';

describe('GestionHorarioComponent', () => {
  let component: GestionHorarioComponent;
  let fixture: ComponentFixture<GestionHorarioComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GestionHorarioComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GestionHorarioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
