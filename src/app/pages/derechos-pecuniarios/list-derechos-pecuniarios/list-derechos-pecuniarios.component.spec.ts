import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ListDerechosPecuniariosComponent } from './list-derechos-pecuniarios.component';

describe('ListDerechosPecuniariosComponent', () => {
  let component: ListDerechosPecuniariosComponent;
  let fixture: ComponentFixture<ListDerechosPecuniariosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ListDerechosPecuniariosComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ListDerechosPecuniariosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
