import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RevisarPlanesEstudioComponent } from './revisar-planes-estudio.component';

describe('RevisarPlanesEstudioComponent', () => {
  let component: RevisarPlanesEstudioComponent;
  let fixture: ComponentFixture<RevisarPlanesEstudioComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RevisarPlanesEstudioComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RevisarPlanesEstudioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
