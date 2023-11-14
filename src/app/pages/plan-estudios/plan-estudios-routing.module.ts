import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PlanEstudiosComponent } from './plan-estudios.component';
import { CreacionPlanEstudiosComponent } from './creacion-plan-estudios/creacion-plan-estudios.component';
import { AuthGuard } from '../../@core/_guards/auth.guard';
import { SummaryPlanesEstudioComponent } from './summary-planes-estudio/summary-planes-estudio.component';
import { VisualizarDocumentoPlanComponent } from './visualizar-documento-plan/visualizar-documento-plan.component';
import { SafeURL } from '../../@core/pipes/safeUrl.pipe';
import { EvaluarPlanEstudiosComponent } from './evaluar-plan-estudios/evaluar-plan-estudios.component';
import { DialogoEvaluarComponent } from './evaluar-plan-estudios/dialogo-evaluar/dialogo-evaluar.component';
import { RevisarPlanesEstudioComponent } from './revisar-planes-estudio/revisar-planes-estudio.component';
import { DialogVerObservacionComponent } from './dialog-ver-observacion/dialog-ver-observacion.component';

const routes: Routes = [{
  path: '',
  component: PlanEstudiosComponent,
  children: [{
    path: 'crear',
    component: CreacionPlanEstudiosComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'evaluar',
    component: EvaluarPlanEstudiosComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'revisar',
    component: RevisarPlanesEstudioComponent,
    canActivate: [AuthGuard]
  }
  ]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PlanEstudiosRoutingModule { }

export const routedComponents = [
  PlanEstudiosComponent,
  CreacionPlanEstudiosComponent,
  SummaryPlanesEstudioComponent,
  SafeURL,
  VisualizarDocumentoPlanComponent,
  EvaluarPlanEstudiosComponent,
  DialogoEvaluarComponent,
  RevisarPlanesEstudioComponent,
  DialogVerObservacionComponent
]