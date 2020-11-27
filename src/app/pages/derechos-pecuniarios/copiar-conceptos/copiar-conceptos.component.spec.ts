import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CopiarConceptosComponent } from './copiar-conceptos.component';

describe('CopiarConceptosComponent', () => {
  let component: CopiarConceptosComponent;
  let fixture: ComponentFixture<CopiarConceptosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CopiarConceptosComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CopiarConceptosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
