import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ProyectoAcademicoComponent } from './proyecto_academico.component';
import { ListProyectoAcademicoComponent } from './list-proyecto_academico/list-proyecto_academico.component';
import { CrudProyectoAcademicoComponent } from './crud-proyecto_academico/crud-proyecto_academico.component';
import { ConsultaProyectoAcademicoComponent } from './consulta-proyecto_academico/consulta-proyecto_academico.component';
import { ModificarProyectoAcademicoComponent } from './modificar-proyecto_academico/modificar-proyecto_academico.component';
import { ListRegistroProyectoAcademicoComponent } from './list-registro_proyecto_academico/list-registro_proyecto_academico.component';
import { RegistroProyectoAcademicoComponent } from './registro-proyecto_academico/registro-proyecto_academico.component';
import { AuthGuard } from '../../@core/_guards/auth.guard';

const routes: Routes = [{
  path: '',
  component: ProyectoAcademicoComponent,
  children: [{
    path: 'list-proyecto_academico',
    component: ListProyectoAcademicoComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'crud-proyecto_academico',
    component: CrudProyectoAcademicoComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'crud-proyecto_academico/:proyecto_id',
    component: CrudProyectoAcademicoComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'consulta-proyecto_academico',
    component: ConsultaProyectoAcademicoComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'modificar-proyecto_academico',
    component: ModificarProyectoAcademicoComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'list-registro_proyecto_academico',
    component: ListRegistroProyectoAcademicoComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'registro-proyecto_academico',
    component: RegistroProyectoAcademicoComponent,
    canActivate: [AuthGuard],
  },
  ],
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
  ConsultaProyectoAcademicoComponent,
  ModificarProyectoAcademicoComponent,
  ListRegistroProyectoAcademicoComponent,
  RegistroProyectoAcademicoComponent,
];
