import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogoSoporteComponent } from './dialogo-soporte.component';

describe('DialogoSoporteComponent', () => {
  let component: DialogoSoporteComponent;
  let fixture: ComponentFixture<DialogoSoporteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DialogoSoporteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogoSoporteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
