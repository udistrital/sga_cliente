import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CalendarioeventoComponent } from './calendarioevento.component';
import { ListCalendarioeventoComponent } from './list-calendarioevento/list-calendarioevento.component';
import { CrudCalendarioeventoComponent } from './crud-calendarioevento/crud-calendarioevento.component';



const routes: Routes = [{
  path: '',
  component: CalendarioeventoComponent,
  children: [{
    path: 'list-calendarioevento',
    component: ListCalendarioeventoComponent,
  }, {
    path: 'crud-calendarioevento',
    component: CrudCalendarioeventoComponent,
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
