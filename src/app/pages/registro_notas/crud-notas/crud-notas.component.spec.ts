import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CrudNotasComponent } from './crud-notas.component';

describe('CrudNotasComponent', () => {
  let component: CrudNotasComponent;
  let fixture: ComponentFixture<CrudNotasComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CrudNotasComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CrudNotasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
