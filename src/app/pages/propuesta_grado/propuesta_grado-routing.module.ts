import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PropuestaGradoComponent } from './propuesta_grado.component';
import { ListPropuestaGradoComponent } from './list-propuesta_grado/list-propuesta_grado.component';
import { CrudPropuestaGradoComponent } from './crud-propuesta_grado/crud-propuesta_grado.component';
import { ViewPropuestaGradoComponent } from './view-propuesta_grado/view-propuesta_grado.component';
import { AuthGuard } from '../../@core/_guards/auth.guard';

const routes: Routes = [{
  path: '',
  component: PropuestaGradoComponent,
  children: [{
    path: 'list-propuesta_grado',
    component: ListPropuestaGradoComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'crud-propuesta_grado',
    component: CrudPropuestaGradoComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'view-propuesta_grado',
    component: ViewPropuestaGradoComponent,
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

export class PropuestaGradoRoutingModule { }

export const routedComponents = [
  PropuestaGradoComponent,
  ListPropuestaGradoComponent,
  CrudPropuestaGradoComponent,
  ViewPropuestaGradoComponent,
];
