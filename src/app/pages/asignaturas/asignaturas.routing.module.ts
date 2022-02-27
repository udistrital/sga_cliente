import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AsignaturasComponent } from './asignaturas.component';
import { NotasParcialesComponent } from './notas-parciales/notas-parciales.component';


const routes: Routes = [{
  path: '',
  component: AsignaturasComponent,
  children: [{
    path: 'notas-parciales',
    component: NotasParcialesComponent,
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