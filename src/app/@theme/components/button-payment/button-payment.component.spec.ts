import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ButtonPaymentComponent } from './button-payment.component';

describe('ButtonPaymentComponent', () => {
  let component: ButtonPaymentComponent;
  let fixture: ComponentFixture<ButtonPaymentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ButtonPaymentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ButtonPaymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
