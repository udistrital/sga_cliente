import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InscritosProyectoComponent } from './inscritos-proyecto.component';

describe('InscritosProyectoComponent', () => {
  let component: InscritosProyectoComponent;
  let fixture: ComponentFixture<InscritosProyectoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InscritosProyectoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InscritosProyectoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
