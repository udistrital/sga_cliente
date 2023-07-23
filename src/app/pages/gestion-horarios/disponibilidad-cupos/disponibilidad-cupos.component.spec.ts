import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DisponibilidadCuposComponent } from './disponibilidad-cupos.component';

describe('DisponibilidadCuposComponent', () => {
  let component: DisponibilidadCuposComponent;
  let fixture: ComponentFixture<DisponibilidadCuposComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DisponibilidadCuposComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DisponibilidadCuposComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
