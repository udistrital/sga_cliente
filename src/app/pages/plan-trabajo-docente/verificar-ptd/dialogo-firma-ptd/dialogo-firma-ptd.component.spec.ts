import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogoFirmaPtdComponent } from './dialogo-firma-ptd.component';

describe('DialogoFirmaPtdComponent', () => {
  let component: DialogoFirmaPtdComponent;
  let fixture: ComponentFixture<DialogoFirmaPtdComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DialogoFirmaPtdComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogoFirmaPtdComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
