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

const routes: Routes = [{
  path: '',
  component: FormacionAcademicaComponent,
  children: [{
    path: 'list-formacion_academica',
    component: ListFormacionAcademicaComponent,
    canActivate: [AuthGuard],
    data: {
      roles: [
        'ADMIN_CAMPUS',
        'ASPIRANTE',
        'Internal/selfsignup',
        'Internal/everyone',
      ],
    },
  }, {
    path: 'crud-formacion_academica',
    component: CrudFormacionAcademicaComponent,
    canActivate: [AuthGuard],
    data: {
      roles: [
        'ADMIN_CAMPUS',
        'ASPIRANTE',
        'Internal/selfsignup',
        'Internal/everyone',
      ],
    },
  },
  {
    path: 'crud-icfes',
    component: CrudIcfesComponent,
    canActivate: [AuthGuard],
    data: {
      roles: [
        'ADMIN_CAMPUS',
        'ASPIRANTE',
        'Internal/selfsignup',
        'Internal/everyone',
      ],
    },
  },
  {
    path: 'crud-preguntas',
    component: CrudPreguntasComponent,
    canActivate: [AuthGuard],
    data: {
      roles: [
        'ADMIN_CAMPUS',
        'ASPIRANTE',
        'Internal/selfsignup',
        'Internal/everyone',
      ],
    },
  },
  {
    path: 'crud-transferencia_interna',
    component: CrudTransferenciaInternaComponent,
    canActivate: [AuthGuard],
    data: {
      roles: [
        'ADMIN_CAMPUS',
        'ASPIRANTE',
        'Internal/selfsignup',
        'Internal/everyone',
      ],
    },
  },
  {
    path: 'view-formacion_academica',
    component: ViewFormacionAcademicaComponent,
    canActivate: [AuthGuard],
    data: {
      roles: [
        'ADMIN_CAMPUS',
        'ASPIRANTE',
        'Internal/selfsignup',
        'Internal/everyone',
      ],
    },
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
  ViewFormacionAcademicaComponent,
];
