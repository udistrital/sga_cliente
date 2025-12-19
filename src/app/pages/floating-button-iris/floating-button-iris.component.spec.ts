import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FloatingButtonIrisComponent } from './floating-button-iris.component';

describe('FloatingButtonIrisComponent', () => {
  let component: FloatingButtonIrisComponent;
  let fixture: ComponentFixture<FloatingButtonIrisComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FloatingButtonIrisComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FloatingButtonIrisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
