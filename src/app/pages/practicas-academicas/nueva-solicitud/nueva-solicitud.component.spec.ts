import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NuevaSolicitudComponent } from './nueva-solicitud.component';

describe('NuevaSoliciitudComponent', () => {
  let component: NuevaSolicitudComponent;
  let fixture: ComponentFixture<NuevaSolicitudComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NuevaSolicitudComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NuevaSolicitudComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
