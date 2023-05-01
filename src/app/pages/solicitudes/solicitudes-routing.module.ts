import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ThemeModule } from '../../@theme/theme.module';

import { SolicitudesComponent } from './solicitudes.component';
import { ActualizacionDatosComponent } from './actualizacion-datos/actualizacion-datos.component';
import { ActualizacionNombresComponent } from './actualizacion-nombres/actualizacion-nombres.component';
import { ListSolicitudesEstudianteComponent } from './list-solicitudes-estudiante/list-solicitudes-estudiante.component';
import { DatosSolicitanteComponent } from './datos-solicitante/datos-solicitante.component';
import { DialogoSoporteComponent } from './dialogo-soporte/dialogo-soporte.component';
import { ViewSolicitudesComponent } from './view-solicitudes/view-solicitudes.component';
import { AuthGuard } from '../../@core/_guards/auth.guard';

const routes: Routes = [{
  path: '',
  component: SolicitudesComponent,
  children: [
    {
      path: 'list-solicitudes-estudiante',
      component: ListSolicitudesEstudianteComponent,
      canActivate: [AuthGuard],
    },
    {
      path: 'ver-solicitudes',
      component: ViewSolicitudesComponent,
      canActivate: [AuthGuard],
    },
  ],
}];

@NgModule({
  imports: [
    ThemeModule,
    RouterModule.forChild(routes),
  ],
  exports: [
    RouterModule,
  ],
})
export class SolicitudesRoutingModule { }

export const routedComponents = [
  SolicitudesComponent,
  ActualizacionDatosComponent,
  ActualizacionNombresComponent,
  ListSolicitudesEstudianteComponent,
  DatosSolicitanteComponent,
  DialogoSoporteComponent,
  ViewSolicitudesComponent,
]
