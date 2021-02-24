import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PerfilAdmitidosComponent } from './perfil-admitidos.component';

describe('PerfilAdmitidosComponent', () => {
  let component: PerfilAdmitidosComponent;
  let fixture: ComponentFixture<PerfilAdmitidosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PerfilAdmitidosComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PerfilAdmitidosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
