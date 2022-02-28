import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NotasParcialesComponent } from './notas-parciales.component';

describe('NotasParcialesComponent', () => {
  let component: NotasParcialesComponent;
  let fixture: ComponentFixture<NotasParcialesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NotasParcialesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NotasParcialesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
