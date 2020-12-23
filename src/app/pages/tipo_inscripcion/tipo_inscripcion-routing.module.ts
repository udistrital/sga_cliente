import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TipoInscripcionComponent } from './tipo_inscripcion.component';
import { ListTipoInscripcionComponent } from './list-tipo_inscripcion/list-tipo_inscripcion.component';
import { CrudTipoInscripcionComponent } from './crud-tipo_inscripcion/crud-tipo_inscripcion.component';



const routes: Routes = [{
  path: '',
  component: TipoInscripcionComponent,
  children: [{
    path: 'list-tipo_inscripcion',
    component: ListTipoInscripcionComponent,
  }, {
    path: 'crud-tipo_inscripcion',
    component: CrudTipoInscripcionComponent,
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

export class TipoInscripcionRoutingModule { }

export const routedComponents = [
  TipoInscripcionComponent,
  ListTipoInscripcionComponent,
  CrudTipoInscripcionComponent,
];
