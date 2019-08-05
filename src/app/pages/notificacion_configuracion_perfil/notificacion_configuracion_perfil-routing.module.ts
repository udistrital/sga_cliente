import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { NotificacionConfiguracionPerfilComponent } from './notificacion_configuracion_perfil.component';
import { ListNotificacionConfiguracionPerfilComponent } from './list-notificacion_configuracion_perfil/list-notificacion_configuracion_perfil.component';
import { CrudNotificacionConfiguracionPerfilComponent } from './crud-notificacion_configuracion_perfil/crud-notificacion_configuracion_perfil.component';



const routes: Routes = [{
  path: '',
  component: NotificacionConfiguracionPerfilComponent,
  children: [{
    path: 'list-notificacion_configuracion_perfil',
    component: ListNotificacionConfiguracionPerfilComponent,
  }, {
    path: 'crud-notificacion_configuracion_perfil',
    component: CrudNotificacionConfiguracionPerfilComponent,
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

export class NotificacionConfiguracionPerfilRoutingModule { }

export const routedComponents = [
  NotificacionConfiguracionPerfilComponent,
  ListNotificacionConfiguracionPerfilComponent,
  CrudNotificacionConfiguracionPerfilComponent,
];
