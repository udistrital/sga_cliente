import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MetodoHttpComponent } from './metodo_http.component';
import { ListMetodoHttpComponent } from './list-metodo_http/list-metodo_http.component';
import { CrudMetodoHttpComponent } from './crud-metodo_http/crud-metodo_http.component';



const routes: Routes = [{
  path: '',
  component: MetodoHttpComponent,
  children: [{
    path: 'list-metodo_http',
    component: ListMetodoHttpComponent,
  }, {
    path: 'crud-metodo_http',
    component: CrudMetodoHttpComponent,
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

export class MetodoHttpRoutingModule { }

export const routedComponents = [
  MetodoHttpComponent,
  ListMetodoHttpComponent,
  CrudMetodoHttpComponent,
];
