import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PlanTrabajoDocenteComponent } from './plan-trabajo-docente.component';
import { AsignarPtdComponent } from './asignar-ptd/asignar-ptd.component';


const routes: Routes = [{
  path: '',
  component: PlanTrabajoDocenteComponent,
  children: [{
    path: 'asignar-ptd',
    component: AsignarPtdComponent
  }]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PlanTrabajoDocenteRoutingModule { }

export const routedComponents = [
  PlanTrabajoDocenteComponent,
  AsignarPtdComponent
]