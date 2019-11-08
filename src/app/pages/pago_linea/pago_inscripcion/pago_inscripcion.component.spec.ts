import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { PagoInscripcionComponent } from './pago_inscripcion.component';

describe('PagoInscripcionComponent', () => {
  let component: PagoInscripcionComponent;
  let fixture: ComponentFixture<PagoInscripcionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [PagoInscripcionComponent],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PagoInscripcionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
