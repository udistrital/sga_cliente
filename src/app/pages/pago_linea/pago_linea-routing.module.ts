import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PagoLineaComponent } from './pago_linea.component';
import { PagoInscripcionComponent } from './pago_inscripcion/pago_inscripcion.component';
import { PagoComprobanteComponent } from './pago_comprobante/pago_comprobante.component';
import { AuthGuard } from '../../@core/_guards/auth.guard';

const routes: Routes = [{
  path: '',
  component: PagoLineaComponent,
  children: [{
    path: 'pago_inscripcion',
    component: PagoInscripcionComponent,
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

export class PagoLineaRoutingModule { }

export const routedComponents = [
  PagoLineaComponent,
  PagoInscripcionComponent,
  PagoComprobanteComponent,
];
