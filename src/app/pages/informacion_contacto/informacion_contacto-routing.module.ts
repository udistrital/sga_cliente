import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { InformacionContactoComponent } from './informacion_contacto.component';
import { ListInformacionContactoComponent } from './list-informacion_contacto/list-informacion_contacto.component';
import { CrudInformacionContactoComponent } from './crud-informacion_contacto/crud-informacion_contacto.component';
import { ViewInformacionContactoComponent } from './view-informacion_contacto/view-informacion_contacto.component';
import { AuthGuard } from '../../@core/_guards/auth.guard';

const routes: Routes = [{
  path: '',
  component: InformacionContactoComponent,
  children: [{
    path: 'list-informacion_contacto',
    component: ListInformacionContactoComponent,
    canActivate: [AuthGuard],
    data: {
      roles: [
        'ADMIN_CAMPUS',
      ],
    },
  }, {
    path: 'crud-informacion_contacto',
    component: CrudInformacionContactoComponent,
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
    path: 'view-informacion_contacto',
    component: ViewInformacionContactoComponent,
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

export class InformacionContactoRoutingModule { }

export const routedComponents = [
  InformacionContactoComponent,
  ListInformacionContactoComponent,
  CrudInformacionContactoComponent,
  ViewInformacionContactoComponent,
];
