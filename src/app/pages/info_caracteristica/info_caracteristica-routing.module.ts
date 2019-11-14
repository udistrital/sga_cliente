import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { InfoCaracteristicaComponent } from './info_caracteristica.component';
import { ListInfoCaracteristicaComponent } from './list-info_caracteristica/list-info_caracteristica.component';
import { CrudInfoCaracteristicaComponent } from './crud-info_caracteristica/crud-info_caracteristica.component';
import { ViewInfoCaracteristicaComponent } from './view-info_caracteristica/view-info_caracteristica.component';
import { AuthGuard } from '../../@core/_guards/auth.guard';

const routes: Routes = [{
  path: '',
  component: InfoCaracteristicaComponent,
  children: [{
    path: 'list-info_caracteristica',
    component: ListInfoCaracteristicaComponent,
    canActivate: [AuthGuard],
    data: {
      roles: [
        'ADMIN_CAMPUS',
      ],
    },
  }, {
    path: 'crud-info_caracteristica',
    component: CrudInfoCaracteristicaComponent,
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
    path: 'view-info_caracteristica',
    component: ViewInfoCaracteristicaComponent,
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

export class InfoCaracteristicaRoutingModule { }

export const routedComponents = [
  InfoCaracteristicaComponent,
  ListInfoCaracteristicaComponent,
  CrudInfoCaracteristicaComponent,
  ViewInfoCaracteristicaComponent,
];
