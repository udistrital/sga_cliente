import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ProyectoAcademicoComponent } from './proyecto_academico.component';
import { ListProyectoAcademicoComponent } from './list-proyecto_academico/list-proyecto_academico.component';
import { CrudProyectoAcademicoComponent } from './crud-proyecto_academico/crud-proyecto_academico.component';



const routes: Routes = [{
  path: '',
  component: ProyectoAcademicoComponent,
  children: [{
    path: 'list-proyecto_academico',
    component: ListProyectoAcademicoComponent,
  }, {
    path: 'crud-proyecto_academico',
    component: CrudProyectoAcademicoComponent,
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

export class ProyectoAcademicoRoutingModule { }

export const routedComponents = [
  ProyectoAcademicoComponent,
  ListProyectoAcademicoComponent,
  CrudProyectoAcademicoComponent,
];
