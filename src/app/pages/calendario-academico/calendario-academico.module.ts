import { NgModule } from '@angular/core';
import { ThemeModule } from '../../@theme/theme.module';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import { ToasterModule } from 'angular2-toaster';
import { FormsModule, ReactiveFormsModule } from '@angular/forms'; 
import { MatDialogModule } from '@angular/material/dialog';
import { CalendarioAcademicoRoutingModule, routedComponents } from './calendario-academico-routing.module';
import { SharedModule } from '../../shared/shared.module';
import { PeriodoModule } from '../periodo/periodo.module';
import { CrudPeriodoComponent } from '../periodo/crud-periodo/crud-periodo.component';
import { ListCalendarioAcademicoComponent } from './list-calendario-academico/list-calendario-academico.component';
import { DefCalendarioAcademicoComponent } from './def-calendario-academico/def-calendario-academico.component';
import { ProcesoCalendarioAcademicoComponent } from './proceso-calendario-academico/proceso-calendario-academico.component';
import { ActividadCalendarioAcademicoComponent } from './actividad-calendario-academico/actividad-calendario-academico.component';

import { EventoService } from '../../@core/data/evento.service';



@NgModule({
  imports: [
    CalendarioAcademicoRoutingModule,
    SharedModule,
    ThemeModule,
    Ng2SmartTableModule,
    ToasterModule,
    MatDialogModule,
    PeriodoModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  declarations: [
    routedComponents
  ],
  exports: [
    ListCalendarioAcademicoComponent,
    DefCalendarioAcademicoComponent,
    ProcesoCalendarioAcademicoComponent,
    ActividadCalendarioAcademicoComponent
  ],
  entryComponents : [
    ProcesoCalendarioAcademicoComponent,
    ActividadCalendarioAcademicoComponent,
    CrudPeriodoComponent,
  ],
  providers: [
    EventoService,
  ]
})
export class CalendarioAcademicoModule { }
