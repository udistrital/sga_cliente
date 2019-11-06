import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { IdiomasComponent } from './idiomas.component';
import { ListIdiomasComponent } from './list-idiomas/list-idiomas.component';
import { CrudIdiomasComponent } from './crud-idiomas/crud-idiomas.component';
import { ViewIdiomasComponent } from './view-idiomas/view-idiomas.component';
import { AuthGuard } from '../../@core/_guards/auth.guard';

const routes: Routes = [{
  path: '',
  component: IdiomasComponent,
  children: [{
    path: 'list-idiomas',
    component: ListIdiomasComponent,
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
    path: 'crud-idiomas',
    component: CrudIdiomasComponent,
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
    path: 'view-idiomas',
    component: ViewIdiomasComponent,
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

export class IdiomasRoutingModule { }

export const routedComponents = [
  IdiomasComponent,
  ListIdiomasComponent,
  ViewIdiomasComponent,
  CrudIdiomasComponent,
];
