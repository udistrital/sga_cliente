import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReporteHistoricoAcreditacionesComponent } from './historico-acreditaciones.component';

describe('ReporteHistoricoAcreditacionesComponent', () => {
  let component: ReporteHistoricoAcreditacionesComponent;
  let fixture: ComponentFixture<ReporteHistoricoAcreditacionesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReporteHistoricoAcreditacionesComponent ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReporteHistoricoAcreditacionesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
