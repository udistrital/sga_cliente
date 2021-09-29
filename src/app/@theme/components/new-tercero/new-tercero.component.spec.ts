/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NewTercero } from './new-tercero.component';

describe('NewTerceroComponent', () => {
  let component: NewTercero;
  let fixture: ComponentFixture<NewTercero>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [NewTercero],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewTercero);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
