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
import { CrudCriterioIcfesComponent } from '../criterio_icfes/crud-criterio_icfes/crud-criterio_icfes.component';
import { AsignacionCuposComponent } from './asignacion_cupos/asignacion_cupos.component';


@NgModule({
  imports: [
    ThemeModule,
    AdmisionRoutingModule,
    MatExpansionModule,
    SharedModule,
    ToasterModule,
    FormacionAcademicaModule,
    CriterioIcfesModule,
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
   ],
  exports: [
    CriterioAdmisionComponent,
    AsignacionCuposComponent,
  ],
})
export class AdmisionModule { }
