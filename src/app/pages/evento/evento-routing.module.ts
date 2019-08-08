import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { EventoComponent } from './evento.component';
import { ListEventoComponent } from './list-evento/list-evento.component';
import { CrudEventoComponent } from './crud-evento/crud-evento.component';



const routes: Routes = [{
  path: '',
  component: EventoComponent,
  children: [{
    path: 'list-evento',
    component: ListEventoComponent,
  }, {
    path: 'crud-evento',
    component: CrudEventoComponent,
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
