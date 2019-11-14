import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ExperienciaLaboralComponent } from './experiencia_laboral.component';
import { ListExperienciaLaboralComponent } from './list-experiencia_laboral/list-experiencia_laboral.component';
import { CrudExperienciaLaboralComponent } from './crud-experiencia_laboral/crud-experiencia_laboral.component';
import { ViewExperienciaLaboralComponent } from './view-experiencia_laboral/view-experiencia_laboral.component';
import { AuthGuard } from '../../@core/_guards/auth.guard';

const routes: Routes = [{
  path: '',
  component: ExperienciaLaboralComponent,
  children: [{
    path: 'list-experiencia_laboral',
    component: ListExperienciaLaboralComponent,
    canActivate: [AuthGuard],
    data: {
      roles: [
        'ADMIN_CAMPUS',
        'ASPIRANTE',
        'Internal/selfsignup',
        'Internal/everyone',
      ],
    },
  }, {
    path: 'crud-experiencia_laboral',
    component: CrudExperienciaLaboralComponent,
    canActivate: [AuthGuard],
    data: {
      roles: [
        'ADMIN_CAMPUS',
        'ASPIRANTE',
        'Internal/selfsignup',
        'Internal/everyone',
      ],
    },
  }, {
    path: 'view-experiencia_laboral',
    component: ViewExperienciaLaboralComponent,
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

export class ExperienciaLaboralRoutingModule { }

export const routedComponents = [
  ExperienciaLaboralComponent,
  ListExperienciaLaboralComponent,
  CrudExperienciaLaboralComponent,
  ViewExperienciaLaboralComponent,
];
