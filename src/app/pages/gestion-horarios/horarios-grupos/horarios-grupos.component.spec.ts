import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HorariosGruposComponent } from './horarios-grupos.component';

describe('HorariosGruposComponent', () => {
  let component: HorariosGruposComponent;
  let fixture: ComponentFixture<HorariosGruposComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HorariosGruposComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HorariosGruposComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
