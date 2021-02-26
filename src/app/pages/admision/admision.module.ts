import { AdmisionRoutingModule, routedComponents } from './admision-routing.module';
import { NgModule } from '@angular/core';
import { ThemeModule } from '../../@theme/theme.module';
import { SharedModule } from '../../shared/shared.module';
import { ToasterModule } from 'angular2-toaster';
import { MatDialogModule } from '@angular/material/dialog'
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
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { NbSpinnerModule } from '@nebular/theme';
import { AdministradorCriteriosComponent } from './administrador-criterios/administrador-criterios.component';
import { DialogoCriteriosComponent } from './dialogo-criterios/dialogo-criterios.component';
import { EvaluacionAspirantesComponent } from './evaluacion-aspirantes/evaluacion-aspirantes.component';
import { ParametrosService } from '../../@core/data/parametros.service';
import { InscripcionService } from '../../@core/data/inscripcion.service';
import { TercerosService } from '../../@core/data/terceros.service';
import { SgaMidService } from '../../@core/data/sga_mid.service';
import { CheckboxAssistanceComponent } from '../../@theme/components/checkbox-assistance/checkbox-assistance.component';
import { DialogoDocumentosComponent } from './dialogo-documentos/dialogo-documentos.component';
import { EvaluacionDocumentosInscritosComponent } from './evaluacion-documentos-inscritos/evaluacion-documentos-inscritos.component';
import { InfoPersonaModule } from '../info_persona/info_persona.module';
import { InfoCaracteristicaModule } from '../info_caracteristica/info_caracteristica.module';
import { InformacionContactoModule } from '../informacion_contacto/informacion_contacto.module';
import { IdiomasModule } from '../idiomas/idiomas.module';
import { ExperienciaLaboralModule } from '../experiencia_laboral/experiencia_laboral.module';
import { DocumentoProgramaModule } from '../documento_programa/documento_programa.module';
import { DescuentoAcademicoModule } from '../descuento_academico/descuento_academico.module';
import { PropuestaGradoModule } from '../propuesta_grado/propuesta_grado.module';
import { ProduccionAcademicaModule } from '../produccion_academica/produccion_academica.module';
import { InscripcionModule } from '../inscripcion/inscripcion.module';

@NgModule({
  imports: [
    ThemeModule,
    AdmisionRoutingModule,
    MatExpansionModule,
    MatDialogModule,
    SharedModule,
    Ng2SmartTableModule,
    NgxExtendedPdfViewerModule,
    NbSpinnerModule,
    ToasterModule,
    FormacionAcademicaModule,
    CriterioIcfesModule,
    AsignacionCupoModule,
    InscripcionModule,
    InfoPersonaModule,
    InfoCaracteristicaModule,
    InformacionContactoModule,
    FormacionAcademicaModule,
    IdiomasModule,
    ExperienciaLaboralModule,
    ProduccionAcademicaModule,
    DocumentoProgramaModule,
    DescuentoAcademicoModule,
    PropuestaGradoModule,
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
    ParametrosService,
    InscripcionService,
    TercerosService,
    SgaMidService,
  ],
   entryComponents: [
    CrudCriterioIcfesComponent,
    CrudAsignacionCupoComponent,
    DialogoCriteriosComponent,
    CheckboxAssistanceComponent,
    DialogoDocumentosComponent,
   ],
  exports: [
    CriterioAdmisionComponent,
    AsignacionCuposComponent,
    ActualizacionEstadoComponent,
    ListadoAspiranteComponent,
    AdministradorCriteriosComponent,
    DialogoCriteriosComponent,
    EvaluacionAspirantesComponent,
    EvaluacionDocumentosInscritosComponent,
  ],
})
export class AdmisionModule { }
