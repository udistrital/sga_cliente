import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewSolicitudesComponent } from './view-solicitudes.component';

describe('ViewSolicitudesComponent', () => {
  let component: ViewSolicitudesComponent;
  let fixture: ComponentFixture<ViewSolicitudesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ViewSolicitudesComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewSolicitudesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
