import { AsignacionCupoRoutingModule, routedComponents } from './asignacion_cupo-routing.module';
import { NgModule } from '@angular/core';
import { ThemeModule } from '../../@theme/theme.module';
import { PersonaService } from '../../@core/data/persona.service';
import { EnteService } from '../../@core/data/ente.service';
import { InscripcionService } from '../../@core/data/inscripcion.service';
import { CampusMidService } from '../../@core/data/campus_mid.service';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import { ToasterModule } from 'angular2-toaster';
import { SharedModule } from '../../shared/shared.module';
import { CrudAsignacionCupoComponent } from './crud-asignacion_cupo/crud-asignacion_cupo.component';

@NgModule({
  imports: [
    ThemeModule,
    AsignacionCupoRoutingModule,
    Ng2SmartTableModule,
    ToasterModule,
    SharedModule,
  ],
  declarations: [
    ...routedComponents,
  ],
  providers: [
    PersonaService,
    EnteService,
    CampusMidService,
    InscripcionService,
  ],
  exports: [
    CrudAsignacionCupoComponent,
  ],
})
export class AsignacionCupoModule { }
