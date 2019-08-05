import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PerfilXMenuOpcionComponent } from './perfil_x_menu_opcion.component';
import { ListPerfilXMenuOpcionComponent } from './list-perfil_x_menu_opcion/list-perfil_x_menu_opcion.component';
import { CrudPerfilXMenuOpcionComponent } from './crud-perfil_x_menu_opcion/crud-perfil_x_menu_opcion.component';



const routes: Routes = [{
  path: '',
  component: PerfilXMenuOpcionComponent,
  children: [{
    path: 'list-perfil_x_menu_opcion',
    component: ListPerfilXMenuOpcionComponent,
  }, {
    path: 'crud-perfil_x_menu_opcion',
    component: CrudPerfilXMenuOpcionComponent,
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

export class PerfilXMenuOpcionRoutingModule { }

export const routedComponents = [
  PerfilXMenuOpcionComponent,
  ListPerfilXMenuOpcionComponent,
  CrudPerfilXMenuOpcionComponent,
];
