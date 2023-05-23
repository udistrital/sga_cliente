import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PlanTrabajoDocenteComponent } from './plan-trabajo-docente.component';
import { AsignarPtdComponent } from './asignar-ptd/asignar-ptd.component';
import { HorarioCargaLectivaComponent } from './horario-carga-lectiva/horario-carga-lectiva.component';
import { VerificarPtdComponent } from './verificar-ptd/verificar-ptd.component';
import { ConsolidadoComponent } from './consolidado/consolidado.component';
import { RevisionConsolidadoComponent } from './revision-consolidado/revision-consolidado.component';


const routes: Routes = [{
  path: '',
  component: PlanTrabajoDocenteComponent,
  children: [{
    path: 'asignar-ptd',
    component: AsignarPtdComponent
  },
  {
    path: 'verificar-ptd',
    component: VerificarPtdComponent
  },
  {
    path: 'consolidado',
    component: ConsolidadoComponent
  },
  {
    path: 'revision-consolidado',
    component: RevisionConsolidadoComponent
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
  RevisionConsolidadoComponent
]