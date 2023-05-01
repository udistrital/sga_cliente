import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ProduccionAcademicaComponent } from './produccion_academica.component';
import { ListProduccionAcademicaComponent } from './list-produccion_academica/list-produccion_academica.component';
import { CrudProduccionAcademicaComponent } from './crud-produccion_academica/crud-produccion_academica.component';
import { ViewProduccionAcademicaComponent } from './view-produccion_academica/view-produccion_academica.component';
import { AuthGuard } from '../../@core/_guards/auth.guard';

const routes: Routes = [{
  path: '',
  component: ProduccionAcademicaComponent,
  children: [{
    path: 'list-produccion_academica',
    component: ListProduccionAcademicaComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'view-produccion_academica',
    component: ViewProduccionAcademicaComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'crud-produccion_academica',
    component: CrudProduccionAcademicaComponent,
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

export class ProduccionAcademicaRoutingModule { }

export const routedComponents = [
  ProduccionAcademicaComponent,
  ListProduccionAcademicaComponent,
  ViewProduccionAcademicaComponent,
  CrudProduccionAcademicaComponent,
];
