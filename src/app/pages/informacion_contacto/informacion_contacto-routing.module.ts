import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { InformacionContactoComponent } from './informacion_contacto.component';
import { ListInformacionContactoComponent } from './list-informacion_contacto/list-informacion_contacto.component';
import { CrudInformacionContactoComponent } from './crud-informacion_contacto/crud-informacion_contacto.component';
import { ViewInformacionContactoComponent } from './view-informacion_contacto/view-informacion_contacto.component';
import { AuthGuard } from '../../@core/_guards/auth.guard';
import { CrudInformacionFamiliarComponent } from './crud-informacion_familiar/crud-informacion_familiar.component';
import { CrudInformacionContactoPregradoComponent } from './crud-informacion_contacto_pregrado/crud-informacion_contacto_pregrado.component';

const routes: Routes = [{
  path: '',
  component: InformacionContactoComponent,
  children: [{
    path: 'list-informacion_contacto',
    component: ListInformacionContactoComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'crud-informacion_contacto_pregrado',
    component: CrudInformacionContactoPregradoComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'crud-informacion_contacto',
    component: CrudInformacionContactoComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'crud-informacion_familiar',
    component: CrudInformacionFamiliarComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'view-informacion_contacto',
    component: ViewInformacionContactoComponent,
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

export class InformacionContactoRoutingModule { }

export const routedComponents = [
  InformacionContactoComponent,
  ListInformacionContactoComponent,
  CrudInformacionContactoComponent,
  CrudInformacionFamiliarComponent,
  CrudInformacionContactoPregradoComponent,
  ViewInformacionContactoComponent,
];
