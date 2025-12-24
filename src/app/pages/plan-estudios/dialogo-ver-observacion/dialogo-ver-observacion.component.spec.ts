import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogoVerObservacionComponent } from './dialogo-ver-observacion.component';

describe('DialogoVerObservacionComponent', () => {
  let component: DialogoVerObservacionComponent;
  let fixture: ComponentFixture<DialogoVerObservacionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DialogoVerObservacionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogoVerObservacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
