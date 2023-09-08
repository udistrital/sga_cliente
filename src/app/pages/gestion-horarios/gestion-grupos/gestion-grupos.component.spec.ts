import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionGruposComponent } from './gestion-grupos.component';

describe('GestionGruposComponent', () => {
  let component: GestionGruposComponent;
  let fixture: ComponentFixture<GestionGruposComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GestionGruposComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GestionGruposComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
