import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IcfesProyectoComponent } from './icfes-proyecto.component';

describe('InscritosProyectoComponent', () => {
  let component: IcfesProyectoComponent;
  let fixture: ComponentFixture<IcfesProyectoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IcfesProyectoComponent ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IcfesProyectoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
