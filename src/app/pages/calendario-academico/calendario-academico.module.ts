import { NgModule } from '@angular/core';
import { ThemeModule } from '../../@theme/theme.module';
import { NbSpinnerModule } from '@nebular/theme';
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
import { DetalleCalendarioComponent } from './detalle-calendario/detalle-calendario.component';
import { AsignarCalendarioProyectoComponent } from './asignar-calendario-proyecto/asignar-calendario-proyecto.component';

import { EventoService } from '../../@core/data/evento.service';
import { CoreService } from '../../@core/data/core.service';
import { DocumentoService } from '../../@core/data/documento.service';
import { NuxeoService } from '../../@core/utils/nuxeo.service';
import { PopUpManager } from '../../managers/popUpManager';
import { CalendarioProyectoComponent } from './calendario-proyecto/calendario-proyecto.component';



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
    NbSpinnerModule,
  ],
  declarations: [
    routedComponents,
  ],
  exports: [
    ListCalendarioAcademicoComponent,
    DefCalendarioAcademicoComponent,
    ProcesoCalendarioAcademicoComponent,
    ActividadCalendarioAcademicoComponent,
    DetalleCalendarioComponent,
    CalendarioProyectoComponent,
  ],
  entryComponents : [
    ProcesoCalendarioAcademicoComponent,
    ActividadCalendarioAcademicoComponent,
    CrudPeriodoComponent,
    AsignarCalendarioProyectoComponent,
  ],
  providers: [
    EventoService,
    CoreService,
    DocumentoService,
    NuxeoService,
    PopUpManager,
  ],
})
export class CalendarioAcademicoModule { }
