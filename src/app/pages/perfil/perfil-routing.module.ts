import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PerfilComponent } from './perfil.component';
import { ListPerfilComponent } from './list-perfil/list-perfil.component';
import { CrudPerfilComponent } from './crud-perfil/crud-perfil.component';
import { AuthGuard } from '../../@core/_guards/auth.guard';

const routes: Routes = [{
  path: '',
  component: PerfilComponent,
  children: [{
    path: 'list-perfil',
    component: ListPerfilComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'crud-perfil',
    component: CrudPerfilComponent,
    canActivate: [AuthGuard],
  }],
}];

@NgModule({
  imports: [
    RouterModule.forChild(routes),
  ],
  exports: [
    RouterModule,
  ],
})

export class PerfilRoutingModule { }

export const routedComponents = [
  PerfilComponent,
  ListPerfilComponent,
  CrudPerfilComponent,
];
