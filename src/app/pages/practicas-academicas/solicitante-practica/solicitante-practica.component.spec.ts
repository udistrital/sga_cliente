import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SolicitantePracticaComponent } from './solicitante-practica.component';

describe('SolicitantePracticaComponent', () => {
  let component: SolicitantePracticaComponent;
  let fixture: ComponentFixture<SolicitantePracticaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SolicitantePracticaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SolicitantePracticaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
