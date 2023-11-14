import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogVerObservacionComponent } from './dialog-ver-observacion.component';

describe('DialogVerObservacionComponent', () => {
  let component: DialogVerObservacionComponent;
  let fixture: ComponentFixture<DialogVerObservacionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DialogVerObservacionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogVerObservacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
