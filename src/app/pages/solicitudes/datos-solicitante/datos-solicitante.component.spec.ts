import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DatosSolicitanteComponent } from './datos-solicitante.component';

describe('DatosSolicitanteComponent', () => {
  let component: DatosSolicitanteComponent;
  let fixture: ComponentFixture<DatosSolicitanteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DatosSolicitanteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DatosSolicitanteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
