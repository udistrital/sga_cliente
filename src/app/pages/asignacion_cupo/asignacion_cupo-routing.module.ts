import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AsignacionCupoComponent } from './asignacion_cupo.component';
import { CrudAsignacionCupoComponent } from './crud-asignacion_cupo/crud-asignacion_cupo.component';
import { AuthGuard } from '../../@core/_guards/auth.guard';

const routes: Routes = [{
  path: '',
  component: AsignacionCupoComponent,
  children: [ {
    path: 'crud-asignacion_cupo',
    component: CrudAsignacionCupoComponent,
    canActivate: [AuthGuard],
    data: {
      roles: [
        'ADMIN_CAMPUS',
        'ASPIRANTE',
        'Internal/selfsignup',
        'Internal/everyone',
      ],
    },
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

export class AsignacionCupoRoutingModule { }

export const routedComponents = [
  AsignacionCupoComponent,
  CrudAsignacionCupoComponent,
];
