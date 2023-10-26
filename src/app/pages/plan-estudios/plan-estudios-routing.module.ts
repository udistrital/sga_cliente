import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PlanEstudiosComponent } from './plan-estudios.component';
import { CreacionPlanEstudiosComponent } from './creacion-plan-estudios/creacion-plan-estudios.component';
import { EdicionPlanEstudiosComponent } from './edicion-plan-estudios/edicion-plan-estudios.component';
import { AuthGuard } from '../../@core/_guards/auth.guard';
import { SummaryPlanesEstudioComponent } from './summary-planes-estudio/summary-planes-estudio.component';
import { EvaluarPlanEstudiosComponent } from './evaluar-plan-estudios/evaluar-plan-estudios.component';
import { DialogoEvaluarComponent } from './evaluar-plan-estudios/dialogo-evaluar/dialogo-evaluar.component';

const routes: Routes = [{
  path: '',
  component: PlanEstudiosComponent,
  children: [{
    path: 'crear',
    component: CreacionPlanEstudiosComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'editar',
    component: EdicionPlanEstudiosComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'evaluar',
    component: EvaluarPlanEstudiosComponent,
    //canActivate: [AuthGuard]
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
  EdicionPlanEstudiosComponent,
  SummaryPlanesEstudioComponent,
  EvaluarPlanEstudiosComponent,
  DialogoEvaluarComponent
]