import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { NotificacionEstadoUsuarioComponent } from './notificacion_estado_usuario.component';
import { ListNotificacionEstadoUsuarioComponent } from './list-notificacion_estado_usuario/list-notificacion_estado_usuario.component';
import { CrudNotificacionEstadoUsuarioComponent } from './crud-notificacion_estado_usuario/crud-notificacion_estado_usuario.component';



const routes: Routes = [{
  path: '',
  component: NotificacionEstadoUsuarioComponent,
  children: [{
    path: 'list-notificacion_estado_usuario',
    component: ListNotificacionEstadoUsuarioComponent,
  }, {
    path: 'crud-notificacion_estado_usuario',
    component: CrudNotificacionEstadoUsuarioComponent,
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

export class NotificacionEstadoUsuarioRoutingModule { }

export const routedComponents = [
  NotificacionEstadoUsuarioComponent,
  ListNotificacionEstadoUsuarioComponent,
  CrudNotificacionEstadoUsuarioComponent,
];
