import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HorarioCargaLectivaComponent } from './horario-carga-lectiva.component';

describe('HorarioCargaLectivaComponent', () => {
  let component: HorarioCargaLectivaComponent;
  let fixture: ComponentFixture<HorarioCargaLectivaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HorarioCargaLectivaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HorarioCargaLectivaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
