import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PreAsignacionPtdComponent } from './preasignacion.component';

describe('PreAsignacionPtdComponent', () => {
  let component: PreAsignacionPtdComponent;
  let fixture: ComponentFixture<PreAsignacionPtdComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [PreAsignacionPtdComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PreAsignacionPtdComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
