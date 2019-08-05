import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { NotificacionTipoComponent } from './notificacion_tipo.component';
import { ListNotificacionTipoComponent } from './list-notificacion_tipo/list-notificacion_tipo.component';
import { CrudNotificacionTipoComponent } from './crud-notificacion_tipo/crud-notificacion_tipo.component';



const routes: Routes = [{
  path: '',
  component: NotificacionTipoComponent,
  children: [{
    path: 'list-notificacion_tipo',
    component: ListNotificacionTipoComponent,
  }, {
    path: 'crud-notificacion_tipo',
    component: CrudNotificacionTipoComponent,
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

export class NotificacionTipoRoutingModule { }

export const routedComponents = [
  NotificacionTipoComponent,
  ListNotificacionTipoComponent,
  CrudNotificacionTipoComponent,
];
