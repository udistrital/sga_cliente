import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { FormacionAcademicaComponent } from './formacion_academica.component';
import { ListFormacionAcademicaComponent } from './list-formacion_academica/list-formacion_academica.component';
import { CrudFormacionAcademicaComponent } from './crud-formacion_academica/crud-formacion_academica.component';
import { ViewFormacionAcademicaComponent } from './view-formacion_academica/view-formacion_academica.component';
import { AuthGuard } from '../../@core/_guards/auth.guard';
import { CrudIcfesComponent } from './crud-icfes/crud-icfes.component';
import { CrudPreguntasComponent } from './crud-preguntas/crud-preguntas.component';
import { CrudTransferenciaInternaComponent } from './crud-transferencia_interna/crud-transferencia_interna.component';
import { CrudReingresoComponent } from './crud-reingreso/crud-reingreso.component';
import { CrudIcfesExternoComponent } from './crud-icfes_externo/crud-icfes_externo.component';

const routes: Routes = [{
  path: '',
  component: FormacionAcademicaComponent,
  children: [{
    path: 'list-formacion_academica',
    component: ListFormacionAcademicaComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'crud-formacion_academica',
    component: CrudFormacionAcademicaComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'crud-icfes',
    component: CrudIcfesComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'crud-icfes_externa',
    component: CrudIcfesExternoComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'crud-preguntas',
    component: CrudPreguntasComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'crud-transferencia_interna',
    component: CrudTransferenciaInternaComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'crud-reingreso',
    component: CrudReingresoComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'view-formacion_academica',
    component: ViewFormacionAcademicaComponent,
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

export class FormacionAcademicaRoutingModule { }

export const routedComponents = [
  FormacionAcademicaComponent,
  ListFormacionAcademicaComponent,
  CrudFormacionAcademicaComponent,
  CrudIcfesComponent,
  CrudPreguntasComponent,
  CrudTransferenciaInternaComponent,
  CrudIcfesExternoComponent,
  CrudReingresoComponent,
  ViewFormacionAcademicaComponent,
];
