import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ProduccionAcademicaComponent } from './produccion_academica.component';
import { ListProduccionAcademicaComponent } from './list-produccion_academica/list-produccion_academica.component';
import { CrudProduccionAcademicaComponent } from './crud-produccion_academica/crud-produccion_academica.component';



const routes: Routes = [{
  path: '',
  component: ProduccionAcademicaComponent,
  children: [{
    path: 'list-produccion_academica',
    component: ListProduccionAcademicaComponent,
  }, {
    path: 'crud-produccion_academica',
    component: CrudProduccionAcademicaComponent,
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

export class ProduccionAcademicaRoutingModule { }

export const routedComponents = [
  ProduccionAcademicaComponent,
  ListProduccionAcademicaComponent,
  CrudProduccionAcademicaComponent,
];
