import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { InscripcionComponent } from './inscripcion.component';
import { InscripcionGeneralComponent } from './inscripcion_general/inscripcion_general.component';
import { PerfilComponent } from './perfil/perfil.component';
import { AuthGuard } from '../../@core/_guards/auth.guard';
import { PreinscripcionComponent } from './preinscripcion/preinscripcion.component';
import { CrudInscripcionMultipleComponent } from './crud-inscripcion_multiple/crud-inscripcion_multiple.component';
import { ViewInscripcionComponent } from './view-inscripcion/view-inscripcion.component';
import { TransferenciaComponent } from './transferencia/transferencia.component';
import { SolicitudTransferenciaComponent } from './solicitud-transferencia/solicitud-transferencia.component';
import { DialogoDocumentosTransferenciasComponent } from './dialogo-documentos-transferencias/dialogo-documentos-transferencias.component';
import { DialogoDocumentosComponent } from '../admision/dialogo-documentos/dialogo-documentos.component';
import { DialogoFormularioPagadorComponent } from '../admision/dialogo-formulario-pagador/dialogo-formulario-pagador.component';

const routes: Routes = [{
  path: '',
  component: InscripcionComponent,
  children: [{
    path: 'preinscripcion',
    component: PreinscripcionComponent,
    canActivate: [AuthGuard],
  }, {
    path: 'transferencia/:process',
    component: TransferenciaComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'solicitud-transferencia/:id/:process',
    component: SolicitudTransferenciaComponent,
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

export class InscripcionRoutingModule { }

export const routedComponents = [
  InscripcionComponent,
  InscripcionGeneralComponent,
  PerfilComponent,
  PreinscripcionComponent,
  CrudInscripcionMultipleComponent,
  ViewInscripcionComponent,
  TransferenciaComponent,
  SolicitudTransferenciaComponent,
  DialogoDocumentosTransferenciasComponent,
  DialogoDocumentosComponent,
  DialogoFormularioPagadorComponent,
];
