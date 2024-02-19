import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ModalidadComponent } from './modalidad.component';
import { ListModalidadComponent } from './list-modalidad/list-modalidad.component';
import { AuthGuard } from '../../@core/_guards/auth.guard';
import { CrudModalidadComponent } from './crud-modalidad/crud-modalidad.component';


const routes: Routes = [{
  path: '',
  component: ModalidadComponent,
  children: [{
    path: 'list-modalidad',
    component: ListModalidadComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'crud-modalidad',
    component: CrudModalidadComponent,
    canActivate: [AuthGuard],
  }],
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ModalidadRoutingModule { }

export const routedComponents = [
  ModalidadComponent,
  ListModalidadComponent,
  CrudModalidadComponent,
];
