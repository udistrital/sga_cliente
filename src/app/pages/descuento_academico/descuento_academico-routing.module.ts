import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DescuentoAcademicoComponent } from './descuento_academico.component';
import { ListDescuentoAcademicoComponent } from './list-descuento_academico/list-descuento_academico.component';
import { CrudDescuentoAcademicoComponent } from './crud-descuento_academico/crud-descuento_academico.component';
import { ViewDescuentoAcademicoComponent } from './view-descuento_academico/view-descuento_academico.component';
import { AuthGuard } from '../../@core/_guards/auth.guard';

const routes: Routes = [{
  path: '',
  component: DescuentoAcademicoComponent,
  children: [{
    path: 'list-descuento_academico',
    component: ListDescuentoAcademicoComponent,
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
    path: 'crud-descuento_academico',
    component: CrudDescuentoAcademicoComponent,
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
    path: 'view-descuento_academico',
    component: ViewDescuentoAcademicoComponent,
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

export class DescuentoAcademicoRoutingModule { }

export const routedComponents = [
  DescuentoAcademicoComponent,
  ListDescuentoAcademicoComponent,
  CrudDescuentoAcademicoComponent,
  ViewDescuentoAcademicoComponent,
];
