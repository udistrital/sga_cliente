import { NgModule } from '@angular/core';
import { PlanTrabajoDocenteRoutingModule, routedComponents } from './plan-trabajo-docente-routing.module';
import { ThemeModule } from '../../@theme/theme.module';
import { SharedModule } from '../../shared/shared.module';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatDialog, MatDialogModule } from '@angular/material';
import { dialogoPreAsignacionPtdComponent } from './preasignacion/dialogo-preasignacion/dialogo-preasignacion.component';
import { EspaciosAcademicosService } from '../../@core/data/espacios_academicos.service';
import { PlanTrabajoDocenteService } from '../../@core/data/plan_trabajo_docente.service';


@NgModule({
  declarations: [...routedComponents],
  imports: [
    ThemeModule,
    SharedModule,
    Ng2SmartTableModule,
    PlanTrabajoDocenteRoutingModule,
    DragDropModule,
    MatDialogModule
  ],
  providers: [
    MatDialog,
    EspaciosAcademicosService,
    PlanTrabajoDocenteService,
  ],
  entryComponents: [
    dialogoPreAsignacionPtdComponent,
  ],
  exports: [
    dialogoPreAsignacionPtdComponent,
  ]
})
export class PlanTrabajoDocenteModule { }
