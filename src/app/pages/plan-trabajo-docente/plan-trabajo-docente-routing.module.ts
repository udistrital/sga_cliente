import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PlanTrabajoDocenteComponent } from './plan-trabajo-docente.component';
import { AsignarPtdComponent } from './asignar-ptd/asignar-ptd.component';
import { HorarioCargaLectivaComponent } from './horario-carga-lectiva/horario-carga-lectiva.component';
import { VerificarPtdComponent } from './verificar-ptd/verificar-ptd.component';
import { ConsolidadoComponent } from './consolidado/consolidado.component';
import { RevisionConsolidadoComponent } from './revision-consolidado/revision-consolidado.component';
import { PreAsignacionPtdComponent } from './preasignacion/preasignacion.component';
import { dialogoPreAsignacionPtdComponent } from './preasignacion/dialogo-preasignacion/dialogo-preasignacion.component';
import { AuthGuard } from '../../@core/_guards/auth.guard';


const routes: Routes = [{
  path: '',
  component: PlanTrabajoDocenteComponent,
  children: [{
    path: 'asignar-ptd',
    component: AsignarPtdComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'verificar-ptd',
    component: VerificarPtdComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'consolidado',
    component: ConsolidadoComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'revision-consolidado',
    component: RevisionConsolidadoComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'preasignacion',
    component: PreAsignacionPtdComponent,
    canActivate: [AuthGuard]
  }]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PlanTrabajoDocenteRoutingModule { }

export const routedComponents = [
  PlanTrabajoDocenteComponent,
  AsignarPtdComponent,
  HorarioCargaLectivaComponent,
  VerificarPtdComponent,
  ConsolidadoComponent,
  RevisionConsolidadoComponent,
  PreAsignacionPtdComponent,
  dialogoPreAsignacionPtdComponent,
]