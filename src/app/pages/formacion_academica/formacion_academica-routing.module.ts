import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { FormacionAcademicaComponent } from './formacion_academica.component';
import { ListFormacionAcademicaComponent } from './list-formacion_academica/list-formacion_academica.component';
import { CrudFormacionAcademicaComponent } from './crud-formacion_academica/crud-formacion_academica.component';
import { ViewFormacionAcademicaComponent } from './view-formacion_academica/view-formacion_academica.component';
import { AuthGuard } from '../../@core/_guards/auth.guard';

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
  }, {
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
  ViewFormacionAcademicaComponent,
];
