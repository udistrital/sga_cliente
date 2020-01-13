import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { InscripcionMultipleComponent } from './inscripcion_multiple.component';
import { CrudInscripcionMultipleComponent } from './crud-inscripcion_multiple/crud-inscripcion_multiple.component';
import { AuthGuard } from '../../@core/_guards/auth.guard';

const routes: Routes = [{
  path: '',
  component: InscripcionMultipleComponent,
  children: [{
    path: 'crud-inscripcion_multiple',
    component: CrudInscripcionMultipleComponent,
    canActivate: [AuthGuard],
    data: {
      roles: [
        'ADMIN_CAMPUS',
        'ASPIRANTE',
        'Internal/selfsignup',
        'Internal/everyone',
      ],
    },
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

export class InscripcionMultipleRoutingModule { }

export const routedComponents = [
  InscripcionMultipleComponent,
  CrudInscripcionMultipleComponent,
];
