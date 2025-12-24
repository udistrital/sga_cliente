import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PlanEstudiosRoutingModule, routedComponents } from './plan-estudios-routing.module';
import { ThemeModule } from '../../@theme/theme.module';
import { SharedModule } from '../../shared/shared.module';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import { PlanEstudiosService } from '../../@core/data/plan_estudios.service';
import { EspaciosAcademicosService } from '../../@core/data/espacios_academicos.service';
import { MatDialog, MatDialogModule } from '@angular/material';
import { DialogoEvaluarComponent } from './evaluar-plan-estudios/dialogo-evaluar/dialogo-evaluar.component';
import { SummaryPlanesEstudioComponent } from './summary-planes-estudio/summary-planes-estudio.component';
import { VisualizarDocumentoPlanComponent } from './visualizar-documento-plan/visualizar-documento-plan.component';
import { DialogVerObservacionComponent } from './dialogo-ver-observacion/dialogo-ver-observacion.component';

@NgModule({
  declarations: [...routedComponents, SummaryPlanesEstudioComponent, VisualizarDocumentoPlanComponent],
  imports: [
    CommonModule,
    PlanEstudiosRoutingModule,
    ThemeModule,
    SharedModule,
    Ng2SmartTableModule,
    MatDialogModule
  ],
  providers: [
    MatDialog,
    PlanEstudiosService,
    EspaciosAcademicosService,
  ],
  entryComponents: [
    VisualizarDocumentoPlanComponent,
    DialogoEvaluarComponent,
    DialogVerObservacionComponent
  ],
  exports: [
    DialogoEvaluarComponent,
    DialogVerObservacionComponent
  ]
})
export class PlanEstudiosModule { }
