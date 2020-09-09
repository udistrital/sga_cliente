import { AdmisionRoutingModule, routedComponents } from './admision-routing.module';
import { NgModule } from '@angular/core';
import { ThemeModule } from '../../@theme/theme.module';
import { SharedModule } from '../../shared/shared.module';
import { ToasterModule } from 'angular2-toaster';
import { NuxeoService } from './../../@core/utils/nuxeo.service';
import { MatExpansionModule } from '@angular/material/expansion';
import { UtilidadesService } from '../../@core/utils/utilidades.service';
import { ImplicitAutenticationService } from './../../@core/utils/implicit_autentication.service';
import { ProyectoAcademicoService } from '../../@core/data/proyecto_academico.service';
import { OikosService } from '../../@core/data/oikos.service';
import { PersonaService } from '../../@core/data/persona.service';
import { UbicacionService } from '../../@core/data/ubicacion.service';
import { FormacionAcademicaModule } from '../formacion_academica/formacion_academica.module';
import { CriterioAdmisionComponent } from './criterio_admision/criterio_admision.component';
import { CriterioIcfesModule } from '../criterio_icfes/criterio_icfes.module';
import { AsignacionCupoModule } from '../asignacion_cupo/asignacion_cupo.module';
import { CrudCriterioIcfesComponent } from '../criterio_icfes/crud-criterio_icfes/crud-criterio_icfes.component';
import { CrudAsignacionCupoComponent } from '../asignacion_cupo/crud-asignacion_cupo/crud-asignacion_cupo.component';
import { AsignacionCuposComponent } from './asignacion_cupos/asignacion_cupos.component';
import { ActualizacionEstadoComponent } from './actualizacion_estado/actualizacion_estado.component';
import { ListadoAspiranteComponent } from './listado_aspirantes/listado_aspirante.component';
import { Ng2SmartTableModule } from 'ng2-smart-table';



@NgModule({
  imports: [
    ThemeModule,
    AdmisionRoutingModule,
    MatExpansionModule,
    SharedModule,
    Ng2SmartTableModule,
    ToasterModule,
    FormacionAcademicaModule,
    CriterioIcfesModule,
    AsignacionCupoModule,
  ],
  declarations: [
    ...routedComponents,
  ],
  providers: [
    ImplicitAutenticationService,
    NuxeoService,
    UtilidadesService,
    ProyectoAcademicoService,
    OikosService,
    PersonaService,
    UbicacionService,
  ],
   entryComponents: [
    CrudCriterioIcfesComponent,
    CrudAsignacionCupoComponent,
   ],
  exports: [
    CriterioAdmisionComponent,
    AsignacionCuposComponent,
    ActualizacionEstadoComponent,
    ListadoAspiranteComponent,
  ],
})
export class AdmisionModule { }
