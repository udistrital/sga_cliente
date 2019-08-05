import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { NotificacionEstadoComponent } from './notificacion_estado.component';
import { ListNotificacionEstadoComponent } from './list-notificacion_estado/list-notificacion_estado.component';
import { CrudNotificacionEstadoComponent } from './crud-notificacion_estado/crud-notificacion_estado.component';



const routes: Routes = [{
  path: '',
  component: NotificacionEstadoComponent,
  children: [{
    path: 'list-notificacion_estado',
    component: ListNotificacionEstadoComponent,
  }, {
    path: 'crud-notificacion_estado',
    component: CrudNotificacionEstadoComponent,
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

export class NotificacionEstadoRoutingModule { }

export const routedComponents = [
  NotificacionEstadoComponent,
  ListNotificacionEstadoComponent,
  CrudNotificacionEstadoComponent,
];
