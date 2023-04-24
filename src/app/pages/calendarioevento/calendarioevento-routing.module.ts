import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CalendarioeventoComponent } from './calendarioevento.component';
import { ListCalendarioeventoComponent } from './list-calendarioevento/list-calendarioevento.component';
import { CrudCalendarioeventoComponent } from './crud-calendarioevento/crud-calendarioevento.component';
import { AuthGuard } from '../../@core/_guards/auth.guard';

const routes: Routes = [{
  path: '',
  component: CalendarioeventoComponent,
  children: [{
    path: 'list-calendarioevento',
    component: ListCalendarioeventoComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'crud-calendarioevento',
    component: CrudCalendarioeventoComponent,
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

export class CalendarioeventoRoutingModule { }

export const routedComponents = [
  CalendarioeventoComponent,
  ListCalendarioeventoComponent,
  CrudCalendarioeventoComponent,
];
