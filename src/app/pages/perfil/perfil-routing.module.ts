import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PerfilComponent } from './perfil.component';
import { ListPerfilComponent } from './list-perfil/list-perfil.component';
import { CrudPerfilComponent } from './crud-perfil/crud-perfil.component';



const routes: Routes = [{
  path: '',
  component: PerfilComponent,
  children: [{
    path: 'list-perfil',
    component: ListPerfilComponent,
  }, {
    path: 'crud-perfil',
    component: CrudPerfilComponent,
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
