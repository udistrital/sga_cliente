import { ProyectoAcademicoRoutingModule, routedComponents } from './proyecto_academico-routing.module';
import { NgModule } from '@angular/core';
import { ThemeModule } from '../../@theme/theme.module';
import { ProduccionAcademicaService } from '../../@core/data/produccion_academica.service';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import { ToasterModule } from 'angular2-toaster';
import { SharedModule } from '../../shared/shared.module';
import { CrudProyectoAcademicoComponent } from './crud-proyecto_academico/crud-proyecto_academico.component';
import { ListProyectoAcademicoComponent } from './list-proyecto_academico/list-proyecto_academico.component';
import { UserService } from '../../@core/data/users.service';
import { PersonaService } from '../../@core/data/persona.service';
import { NuxeoService } from '../../@core/utils/nuxeo.service';
import { NbDialogService } from '@nebular/theme';
import {NgDatepickerModule} from 'ng2-datepicker';
import { ListEnfasisComponent } from '../enfasis/list-enfasis/list-enfasis.component';
import { CrudEnfasisComponent } from '../enfasis/crud-enfasis/crud-enfasis.component';
import { EnfasisModule } from '../enfasis/enfasis.module';



@NgModule({
  imports: [
    ThemeModule,
    ProyectoAcademicoRoutingModule,
    Ng2SmartTableModule,
    ToasterModule,
    SharedModule,
    NgDatepickerModule,
    EnfasisModule,
  ],
  declarations: [
    ...routedComponents,
  ],
  entryComponents: [
    ListEnfasisComponent,
    CrudEnfasisComponent,
  ],
  providers: [
    ProduccionAcademicaService,
    UserService,
    PersonaService,
    NuxeoService,
    NbDialogService,
  ],
  exports: [
    CrudProyectoAcademicoComponent,
    ListProyectoAcademicoComponent,
  ],
})
export class ProyectoAcademicoModule { }
