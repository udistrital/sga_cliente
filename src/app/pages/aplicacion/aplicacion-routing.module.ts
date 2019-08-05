import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AplicacionComponent } from './aplicacion.component';
import { ListAplicacionComponent } from './list-aplicacion/list-aplicacion.component';
import { CrudAplicacionComponent } from './crud-aplicacion/crud-aplicacion.component';



const routes: Routes = [{
  path: '',
  component: AplicacionComponent,
  children: [{
    path: 'list-aplicacion',
    component: ListAplicacionComponent,
  }, {
    path: 'crud-aplicacion',
    component: CrudAplicacionComponent,
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

export class AplicacionRoutingModule { }

export const routedComponents = [
  AplicacionComponent,
  ListAplicacionComponent,
  CrudAplicacionComponent,
];
