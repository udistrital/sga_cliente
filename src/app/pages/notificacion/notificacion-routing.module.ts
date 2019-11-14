import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { NotificacionComponent } from './notificacion.component';
import { ListadoComponent } from './listado/listado.component';

const routes: Routes = [{
  path: '',
  component: NotificacionComponent,
  children: [{
    path: 'listado',
    component: ListadoComponent,
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

export class NotificacionRoutingModule { }

export const routedComponents = [
  NotificacionComponent,
  ListadoComponent,
];
