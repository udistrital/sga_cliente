import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ActualizacionDatosComponent } from './actualizacion-datos.component';

describe('ActualizacionDatosComponent', () => {
  let component: ActualizacionDatosComponent;
  let fixture: ComponentFixture<ActualizacionDatosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ActualizacionDatosComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ActualizacionDatosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
