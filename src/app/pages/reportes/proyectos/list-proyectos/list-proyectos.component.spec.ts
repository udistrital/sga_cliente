import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReporteProyectosListComponent } from './list-proyectos.component';

describe('ReporteProyectosListComponent', () => {
  let component: ReporteProyectosListComponent;
  let fixture: ComponentFixture<ReporteProyectosListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReporteProyectosListComponent ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReporteProyectosListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
