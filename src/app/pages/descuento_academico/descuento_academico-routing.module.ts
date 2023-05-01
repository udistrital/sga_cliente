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
  },
  {
    path: 'crud-descuento_academico',
    component: CrudDescuentoAcademicoComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'view-descuento_academico',
    component: ViewDescuentoAcademicoComponent,
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

export class DescuentoAcademicoRoutingModule { }

export const routedComponents = [
  DescuentoAcademicoComponent,
  ListDescuentoAcademicoComponent,
  CrudDescuentoAcademicoComponent,
  ViewDescuentoAcademicoComponent,
];
