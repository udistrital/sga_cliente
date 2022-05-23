import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared/shared.module';
import { NbSpinnerModule, NbCardModule } from '@nebular/theme';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import { ThemeModule } from '../../@theme/theme.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';

import { CalendarioAcademicoRoutingModule, routedComponents } from './calendario-academico-routing.module';
import { PeriodoModule } from '../periodo/periodo.module';
import { CrudPeriodoComponent } from '../periodo/crud-periodo/crud-periodo.component';
import { ListCalendarioAcademicoComponent } from './list-calendario-academico/list-calendario-academico.component';
import { DefCalendarioAcademicoComponent } from './def-calendario-academico/def-calendario-academico.component';
import { ProcesoCalendarioAcademicoComponent } from './proceso-calendario-academico/proceso-calendario-academico.component';
import { ActividadCalendarioAcademicoComponent } from './actividad-calendario-academico/actividad-calendario-academico.component';
import { DetalleCalendarioComponent } from './detalle-calendario/detalle-calendario.component';
import { AsignarCalendarioProyectoComponent } from './asignar-calendario-proyecto/asignar-calendario-proyecto.component';
import { CalendarioProyectoComponent } from './calendario-proyecto/calendario-proyecto.component';

import { EventoService } from '../../@core/data/evento.service';
import { ParametrosService } from '../../@core/data/parametros.service';
import { DocumentoService } from '../../@core/data/documento.service';
import { NuxeoService } from '../../@core/utils/nuxeo.service';
import { PopUpManager } from '../../managers/popUpManager';
import { MAT_MOMENT_DATE_ADAPTER_OPTIONS, MatMomentDateModule } from '@angular/material-moment-adapter';
import { EdicionActividadesProgramasComponent } from './edicion-actividades-programas/edicion-actividades-programas.component';
import { AdministracionCalendarioComponent } from './administracion-calendario/administracion-calendario.component';

@NgModule({
  imports: [
    CalendarioAcademicoRoutingModule,
    NbCardModule,
    SharedModule,
    ThemeModule,
    CommonModule,
    Ng2SmartTableModule,
    MatDialogModule,
    PeriodoModule,
    FormsModule,
    ReactiveFormsModule,
    NbSpinnerModule,
    MatMomentDateModule,
  ],
  declarations: [
    routedComponents,
    EdicionActividadesProgramasComponent,
    AdministracionCalendarioComponent,
  ],
  exports: [
    ListCalendarioAcademicoComponent,
    DefCalendarioAcademicoComponent,
    ProcesoCalendarioAcademicoComponent,
    ActividadCalendarioAcademicoComponent,
    DetalleCalendarioComponent,
    CalendarioProyectoComponent,
    EdicionActividadesProgramasComponent,
    AdministracionCalendarioComponent
  ],
  entryComponents : [
    ProcesoCalendarioAcademicoComponent,
    ActividadCalendarioAcademicoComponent,
    CrudPeriodoComponent,
    AsignarCalendarioProyectoComponent,
    EdicionActividadesProgramasComponent,
  ],
  providers: [
    EventoService,
    ParametrosService,
    DocumentoService,
    NuxeoService,
    PopUpManager,
    {provide: MAT_MOMENT_DATE_ADAPTER_OPTIONS, useValue: {useUtc: true}}
  ],
})
export class CalendarioAcademicoModule { }
