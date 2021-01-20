import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { InscripcionComponent } from './inscripcion.component';
import { InscripcionGeneralComponent } from './inscripcion_general/inscripcion_general.component';
import { PerfilComponent } from './perfil/perfil.component';
import { AuthGuard } from '../../@core/_guards/auth.guard';
import { PreinscripcionComponent } from './preinscripcion/preinscripcion.component';
import { CrudInscripcionMultipleComponent } from './crud-inscripcion_multiple/crud-inscripcion_multiple.component';

const routes: Routes = [{
  path: '',
  component: InscripcionComponent,
  children: [{
    path: 'preinscripcion',
    component: PreinscripcionComponent,
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
  PreinscripcionComponent,
  CrudInscripcionMultipleComponent,
];
