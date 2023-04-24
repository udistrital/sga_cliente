import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AsignaturasComponent } from './asignaturas.component';
import { NotasParcialesComponent } from './notas-parciales/notas-parciales.component';
import { AuthGuard } from '../../@core/_guards/auth.guard';

const routes: Routes = [{
  path: '',
  component: AsignaturasComponent,
  children: [{
    path: 'notas-parciales',
    component: NotasParcialesComponent,
    canActivate: [AuthGuard],
  }],
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AsignaturasRoutingModule { }

export const routedComponents = [
  AsignaturasComponent,
  NotasParcialesComponent
]
