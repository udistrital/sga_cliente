import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdmisionProyectoComponent } from './admision-proyecto.component';

describe('AdmisionProyectoComponent', () => {
  let component: AdmisionProyectoComponent;
  let fixture: ComponentFixture<AdmisionProyectoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdmisionProyectoComponent ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdmisionProyectoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
