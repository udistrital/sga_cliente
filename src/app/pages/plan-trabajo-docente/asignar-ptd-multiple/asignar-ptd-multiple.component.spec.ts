import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AsignarPtdMultipleComponent } from './asignar-ptd-multiple.component';

describe('AsignarPtdMultipleComponent', () => {
  let component: AsignarPtdMultipleComponent;
  let fixture: ComponentFixture<AsignarPtdMultipleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AsignarPtdMultipleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AsignarPtdMultipleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
