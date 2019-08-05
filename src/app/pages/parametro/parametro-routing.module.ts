import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ParametroComponent } from './parametro.component';
import { ListParametroComponent } from './list-parametro/list-parametro.component';
import { CrudParametroComponent } from './crud-parametro/crud-parametro.component';



const routes: Routes = [{
  path: '',
  component: ParametroComponent,
  children: [{
    path: 'list-parametro',
    component: ListParametroComponent,
  }, {
    path: 'crud-parametro',
    component: CrudParametroComponent,
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

export class ParametroRoutingModule { }

export const routedComponents = [
  ParametroComponent,
  ListParametroComponent,
  CrudParametroComponent,
];
