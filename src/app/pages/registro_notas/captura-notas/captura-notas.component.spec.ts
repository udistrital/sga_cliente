import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CapturaNotasComponent } from './captura-notas.component';

describe('CapturaNotasComponent', () => {
  let component: CapturaNotasComponent;
  let fixture: ComponentFixture<CapturaNotasComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CapturaNotasComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CapturaNotasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
