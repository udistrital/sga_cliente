import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { dialogoPreAsignacionPtdComponent } from './dialogo-preasignacion.component';

describe('dialogoPreAsignacionPtdComponent', () => {
  let component: dialogoPreAsignacionPtdComponent;
  let fixture: ComponentFixture<dialogoPreAsignacionPtdComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [dialogoPreAsignacionPtdComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(dialogoPreAsignacionPtdComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
