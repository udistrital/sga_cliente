import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VisualizarDocumentoPlanComponent } from './visualizar-documento-plan.component';

describe('VisualizarDocumentoPlanComponent', () => {
  let component: VisualizarDocumentoPlanComponent;
  let fixture: ComponentFixture<VisualizarDocumentoPlanComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VisualizarDocumentoPlanComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VisualizarDocumentoPlanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
