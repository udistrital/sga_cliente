import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { EventoComponent } from './evento.component';
import { ListEventoComponent } from './list-evento/list-evento.component';
import { CrudEventoComponent } from './crud-evento/crud-evento.component';
import { AuthGuard } from '../../@core/_guards/auth.guard';

const routes: Routes = [{
  path: '',
  component: EventoComponent,
  children: [{
    path: 'list-evento',
    component: ListEventoComponent,
    canActivate: [AuthGuard],
  }, {
    path: 'crud-evento',
    component: CrudEventoComponent,
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

export class EventoRoutingModule { }

export const routedComponents = [
  EventoComponent,
  ListEventoComponent,
  CrudEventoComponent,
];
