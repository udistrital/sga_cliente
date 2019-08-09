import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TipoPeriodoComponent } from './tipo_periodo.component';
import { ListTipoPeriodoComponent } from './list-tipo_periodo/list-tipo_periodo.component';
import { CrudTipoPeriodoComponent } from './crud-tipo_periodo/crud-tipo_periodo.component';



const routes: Routes = [{
  path: '',
  component: TipoPeriodoComponent,
  children: [{
    path: 'list-tipo_periodo',
    component: ListTipoPeriodoComponent,
  }, {
    path: 'crud-tipo_periodo',
    component: CrudTipoPeriodoComponent,
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

export class TipoPeriodoRoutingModule { }

export const routedComponents = [
  TipoPeriodoComponent,
  ListTipoPeriodoComponent,
  CrudTipoPeriodoComponent,
];
