import { FormacionAcademicaRoutingModule, routedComponents } from './formacion_academica-routing.module';
import { NgModule } from '@angular/core';
import { CampusMidService } from '../../@core/data/campus_mid.service';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import { ToasterModule } from 'angular2-toaster';
import { SharedModule } from '../../shared/shared.module';
import { CrudFormacionAcademicaComponent } from './crud-formacion_academica/crud-formacion_academica.component';
import { ListFormacionAcademicaComponent } from './list-formacion_academica/list-formacion_academica.component';
import { ViewFormacionAcademicaComponent } from './view-formacion_academica/view-formacion_academica.component';
import { UserService } from '../../@core/data/users.service';
import { SgaMidService } from '../../@core/data/sga_mid.service';
import { FormacionAcademicaService } from '../../@core/data/formacion_academica.service';
import { CrudIcfesComponent } from './crud-icfes/crud-icfes.component';
import { CrudPreguntasComponent } from './crud-preguntas/crud-preguntas.component';
import { CrudTransferenciaInternaComponent } from './crud-transferencia_interna/crud-transferencia_interna.component';
import { CrudReingresoComponent } from './crud-reingreso/crud-reingreso.component';
import { CrudIcfesExternoComponent } from './crud-icfes_externo/crud-icfes_externo.component';
import { CrudExternoComponent } from './crud-externo/crud-externo.component';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';

@NgModule({
  imports: [
    MatCardModule,
    MatTabsModule,
    FormacionAcademicaRoutingModule,
    Ng2SmartTableModule,
    ToasterModule,
    SharedModule,
    MatSelectModule,
  ],
  declarations: [
    ...routedComponents,
  ],
  providers: [
    CampusMidService,
    UserService,
    FormacionAcademicaService,
    SgaMidService,
  ],
  exports: [
    CrudFormacionAcademicaComponent,
    CrudIcfesComponent,
    ListFormacionAcademicaComponent,
    CrudPreguntasComponent,
    CrudTransferenciaInternaComponent,
    CrudReingresoComponent,
    CrudIcfesExternoComponent,
    CrudExternoComponent,
    ViewFormacionAcademicaComponent,
  ],
})
export class FormacionAcademicaModule { }
