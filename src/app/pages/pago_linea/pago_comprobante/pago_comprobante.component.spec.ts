import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { PagoComprobanteComponent } from './pago_comprobante.component';

describe('PagoComprobanteComponent', () => {
  let component: PagoComprobanteComponent;
  let fixture: ComponentFixture<PagoComprobanteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [PagoComprobanteComponent],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PagoComprobanteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
