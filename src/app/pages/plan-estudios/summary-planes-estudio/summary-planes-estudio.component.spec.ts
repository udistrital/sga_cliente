import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SummaryPlanesEstudioComponent } from './summary-planes-estudio.component';

describe('SummaryPlanesEstudioComponent', () => {
  let component: SummaryPlanesEstudioComponent;
  let fixture: ComponentFixture<SummaryPlanesEstudioComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SummaryPlanesEstudioComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SummaryPlanesEstudioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
