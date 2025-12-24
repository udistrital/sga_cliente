import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogoEvaluarComponent } from './dialogo-evaluar.component';

describe('DialogoEvaluarComponent', () => {
  let component: DialogoEvaluarComponent;
  let fixture: ComponentFixture<DialogoEvaluarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DialogoEvaluarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogoEvaluarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
