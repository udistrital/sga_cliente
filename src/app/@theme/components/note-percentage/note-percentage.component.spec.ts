import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NotePercentageComponent } from './note-percentage.component';

describe('NotePercentageComponent', () => {
  let component: NotePercentageComponent;
  let fixture: ComponentFixture<NotePercentageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NotePercentageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NotePercentageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
