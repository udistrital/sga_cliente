import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DefinirConceptosComponent } from './definir-conceptos.component';

describe('DefinirConceptosComponent', () => {
  let component: DefinirConceptosComponent;
  let fixture: ComponentFixture<DefinirConceptosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DefinirConceptosComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DefinirConceptosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
