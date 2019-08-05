import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { NotificacionConfiguracionComponent } from './notificacion_configuracion.component';
import { ListNotificacionConfiguracionComponent } from './list-notificacion_configuracion/list-notificacion_configuracion.component';
import { CrudNotificacionConfiguracionComponent } from './crud-notificacion_configuracion/crud-notificacion_configuracion.component';



const routes: Routes = [{
  path: '',
  component: NotificacionConfiguracionComponent,
  children: [{
    path: 'list-notificacion_configuracion',
    component: ListNotificacionConfiguracionComponent,
  }, {
    path: 'crud-notificacion_configuracion',
    component: CrudNotificacionConfiguracionComponent,
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

export class NotificacionConfiguracionRoutingModule { }

export const routedComponents = [
  NotificacionConfiguracionComponent,
  ListNotificacionConfiguracionComponent,
  CrudNotificacionConfiguracionComponent,
];
