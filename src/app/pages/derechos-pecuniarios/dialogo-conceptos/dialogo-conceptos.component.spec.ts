import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogoConceptosComponent } from './dialogo-conceptos.component';

describe('DialogoConceptosComponent', () => {
  let component: DialogoConceptosComponent;
  let fixture: ComponentFixture<DialogoConceptosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DialogoConceptosComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogoConceptosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
