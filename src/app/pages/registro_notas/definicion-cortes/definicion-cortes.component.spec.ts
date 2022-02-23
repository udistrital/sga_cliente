import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DefinicionCortesComponent } from './definicion-cortes.component';

describe('DefinicionCortesComponent', () => {
  let component: DefinicionCortesComponent;
  let fixture: ComponentFixture<DefinicionCortesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DefinicionCortesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DefinicionCortesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
