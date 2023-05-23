import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsolidadoComponent } from './consolidado.component';

describe('ConsolidadoComponent', () => {
  let component: ConsolidadoComponent;
  let fixture: ComponentFixture<ConsolidadoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConsolidadoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConsolidadoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
