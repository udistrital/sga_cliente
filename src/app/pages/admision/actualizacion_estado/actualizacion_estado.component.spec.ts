import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ActualizacionEstadoComponent } from './actualizacion_estado.component';

describe('ActualizacionEstadoComponent', () => {
  let component: ActualizacionEstadoComponent;
  let fixture: ComponentFixture<ActualizacionEstadoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ActualizacionEstadoComponent],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ActualizacionEstadoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
