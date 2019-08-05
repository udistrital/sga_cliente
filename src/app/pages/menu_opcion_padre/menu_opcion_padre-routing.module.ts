import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MenuOpcionPadreComponent } from './menu_opcion_padre.component';
import { ListMenuOpcionPadreComponent } from './list-menu_opcion_padre/list-menu_opcion_padre.component';
import { CrudMenuOpcionPadreComponent } from './crud-menu_opcion_padre/crud-menu_opcion_padre.component';



const routes: Routes = [{
  path: '',
  component: MenuOpcionPadreComponent,
  children: [{
    path: 'list-menu_opcion_padre',
    component: ListMenuOpcionPadreComponent,
  }, {
    path: 'crud-menu_opcion_padre',
    component: CrudMenuOpcionPadreComponent,
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

export class MenuOpcionPadreRoutingModule { }

export const routedComponents = [
  MenuOpcionPadreComponent,
  ListMenuOpcionPadreComponent,
  CrudMenuOpcionPadreComponent,
];
