import { OrganizacionService } from '../../@core/data/organizacion.service';
import { ExperienciaLaboralRoutingModule, routedComponents } from './experiencia_laboral-routing.module';
import { NgModule } from '@angular/core';
import { CampusMidService } from '../../@core/data/campus_mid.service';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import { ToasterModule } from 'angular2-toaster';
import { SharedModule } from '../../shared/shared.module';
import { CrudExperienciaLaboralComponent } from './crud-experiencia_laboral/crud-experiencia_laboral.component';
import { ListExperienciaLaboralComponent } from './list-experiencia_laboral/list-experiencia_laboral.component';
import { ViewExperienciaLaboralComponent } from './view-experiencia_laboral/view-experiencia_laboral.component';
import { ExperienciaService } from '../../@core/data/experiencia.service';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';

@NgModule({
  imports: [
    MatCardModule,
    MatTabsModule,
    ExperienciaLaboralRoutingModule,
    Ng2SmartTableModule,
    ToasterModule,
    SharedModule,
  ],
  declarations: [
    ...routedComponents,
  ],
  providers: [
    CampusMidService,
    OrganizacionService,
    ExperienciaService,
  ],
  exports: [
    CrudExperienciaLaboralComponent,
    ListExperienciaLaboralComponent,
    ViewExperienciaLaboralComponent,
  ],
})
export class ExperienciaLaboralModule { }
