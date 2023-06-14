import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DinamicFormGroupComponent } from './dinamic-form-group.component';

describe('DinamicFormGroupComponent', () => {
  let component: DinamicFormGroupComponent;
  let fixture: ComponentFixture<DinamicFormGroupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DinamicFormGroupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DinamicFormGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
