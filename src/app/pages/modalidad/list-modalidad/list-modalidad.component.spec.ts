import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ListModalidadComponent } from './list-modalidad.component';

describe('ListModalidadComponent', () => {
  let component: ListModalidadComponent;
  let fixture: ComponentFixture<ListModalidadComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ListModalidadComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ListModalidadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
