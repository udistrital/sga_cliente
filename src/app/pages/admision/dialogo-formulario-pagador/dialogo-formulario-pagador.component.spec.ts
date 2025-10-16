import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogoFormularioPagadorComponent } from './dialogo-formulario-pagador.component';

describe('DialogoFormularioPagadorComponent', () => {
  let component: DialogoFormularioPagadorComponent;
  let fixture: ComponentFixture<DialogoFormularioPagadorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DialogoFormularioPagadorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogoFormularioPagadorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
