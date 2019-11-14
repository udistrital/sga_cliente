import { InscripcionRoutingModule, routedComponents } from './inscripcion-routing.module';
import { NgModule } from '@angular/core';
import { ThemeModule } from '../../@theme/theme.module';
import { SharedModule } from '../../shared/shared.module';
import { ToasterModule } from 'angular2-toaster';
import { PosgradoComponent } from './posgrado/posgrado.component';
import { NuxeoService } from './../../@core/utils/nuxeo.service';
import { MatExpansionModule } from '@angular/material/expansion';
import { UtilidadesService } from '../../@core/utils/utilidades.service';
import { ImplicitAutenticationService } from './../../@core/utils/implicit_autentication.service';
import { ProyectoAcademicoService } from '../../@core/data/proyecto_academico.service';
import { OikosService } from '../../@core/data/oikos.service';
import { PersonaService } from '../../@core/data/persona.service';
import { UbicacionService } from '../../@core/data/ubicacion.service';
import { ProduccionAcademicaService } from '../../@core/data/produccion_academica.service';
import { DescuentoAcademicoService } from '../../@core/data/descuento_academico.service';
import { DocumentoProgramaService } from '../../@core/data/documento_programa.service';
import { CampusMidService } from '../../@core/data/campus_mid.service';
import { InfoPersonaModule } from '../info_persona/info_persona.module';
import { CrudInfoPersonaComponent } from '../info_persona/crud-info_persona/crud-info_persona.component';
import { InfoCaracteristicaModule } from '../info_caracteristica/info_caracteristica.module';
import { CrudInfoCaracteristicaComponent } from '../info_caracteristica/crud-info_caracteristica/crud-info_caracteristica.component';
import { InformacionContactoModule } from '../informacion_contacto/informacion_contacto.module';
import { CrudInformacionContactoComponent } from '../informacion_contacto/crud-informacion_contacto/crud-informacion_contacto.component';
import { FormacionAcademicaModule } from '../formacion_academica/formacion_academica.module';
import { ListFormacionAcademicaComponent } from '../formacion_academica/list-formacion_academica/list-formacion_academica.component';
import { CrudFormacionAcademicaComponent } from '../formacion_academica/crud-formacion_academica/crud-formacion_academica.component';
import { IdiomasModule } from '../idiomas/idiomas.module';
import { ListIdiomasComponent } from '../idiomas/list-idiomas/list-idiomas.component';
import { CrudIdiomasComponent } from '../idiomas/crud-idiomas/crud-idiomas.component';
import { ExperienciaLaboralModule } from '../experiencia_laboral/experiencia_laboral.module';
import { ListExperienciaLaboralComponent } from '../experiencia_laboral/list-experiencia_laboral/list-experiencia_laboral.component';
import { CrudExperienciaLaboralComponent } from '../experiencia_laboral/crud-experiencia_laboral/crud-experiencia_laboral.component';
// tslint:disable-next-line:max-line-length
import { ProduccionAcademicaModule } from '../produccion_academica/produccion_academica.module';
import { ListProduccionAcademicaComponent } from '../produccion_academica/list-produccion_academica/list-produccion_academica.component';
import { DocumentoProgramaModule } from '../documento_programa/documento_programa.module';
// tslint:enable:max-line-length
import { ListDocumentoProgramaComponent } from '../documento_programa/list-documento_programa/list-documento_programa.component';
import { CrudDocumentoProgramaComponent } from '../documento_programa/crud-documento_programa/crud-documento_programa.component';
import { DescuentoAcademicoModule } from '../descuento_academico/descuento_academico.module';
import { ListDescuentoAcademicoComponent } from '../descuento_academico/list-descuento_academico/list-descuento_academico.component';
import { CrudDescuentoAcademicoComponent } from '../descuento_academico/crud-descuento_academico/crud-descuento_academico.component';
import { PropuestaGradoModule } from '../propuesta_grado/propuesta_grado.module';
import { CrudPropuestaGradoComponent } from '../propuesta_grado/crud-propuesta_grado/crud-propuesta_grado.component';

@NgModule({
  imports: [
    ThemeModule,
    InscripcionRoutingModule,
    MatExpansionModule,
    SharedModule,
    ToasterModule,
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
    CampusMidService,
    ProduccionAcademicaService,
    DocumentoProgramaService,
    DescuentoAcademicoService,

  ],
   entryComponents: [
    CrudInfoPersonaComponent,
    CrudInfoCaracteristicaComponent,
    // CrudInformacionContactoComponent,
    ListFormacionAcademicaComponent,
    CrudFormacionAcademicaComponent,
    ListIdiomasComponent,
    CrudIdiomasComponent,
    ListExperienciaLaboralComponent,
    CrudExperienciaLaboralComponent,
    ListProduccionAcademicaComponent,
    ListDocumentoProgramaComponent,
    CrudDocumentoProgramaComponent,
    ListDescuentoAcademicoComponent,
    CrudDescuentoAcademicoComponent,
    CrudPropuestaGradoComponent,
   ],
  exports: [
    PosgradoComponent,
  ],
})
export class InscripcionModule { }
