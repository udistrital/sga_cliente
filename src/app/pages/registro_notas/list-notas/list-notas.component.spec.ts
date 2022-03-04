import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ListNotasComponent } from './list-notas.component';

describe('ListNotasComponent', () => {
  let component: ListNotasComponent;
  let fixture: ComponentFixture<ListNotasComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ListNotasComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ListNotasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
