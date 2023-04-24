import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { NotificacionComponent } from './notificacion.component';
import { ListadoComponent } from './listado/listado.component';
import { AuthGuard } from '../../@core/_guards/auth.guard';

const routes: Routes = [{
  path: '',
  component: NotificacionComponent,
  children: [{
    path: 'listado',
    component: ListadoComponent,
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

export class NotificacionRoutingModule { }

export const routedComponents = [
  NotificacionComponent,
  ListadoComponent,
];
