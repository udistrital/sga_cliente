import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { InscripcionComponent } from './inscripcion.component';
import { InscripcionGeneralComponent } from './inscripcion_general/inscripcion_general.component';
import { PerfilComponent } from './perfil/perfil.component';
import { AuthGuard } from '../../@core/_guards/auth.guard';

const routes: Routes = [{
  path: '',
  component: InscripcionComponent,
  children: [{
    path: 'inscripcion_general',
    component: InscripcionGeneralComponent,
    // data: {
    //   roles: [
    //     'ADMIN_CAMPUS',
    //     'ASPIRANTE',
    //     'Internal/selfsignup',
    //     'Internal/everyone',
    //   ],
    // },
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

export class InscripcionRoutingModule { }

export const routedComponents = [
  InscripcionComponent,
  InscripcionGeneralComponent,
  PerfilComponent,
];
