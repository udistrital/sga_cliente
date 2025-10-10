import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ReportesComponent } from './reportes.component';
import { VisualizacionComponent } from './visualizacion/visualizacion.component';
import { AuthGuard } from '../../@core/_guards/auth.guard';

const routes: Routes = [{
  path: '',
  component: ReportesComponent,
  children: [
    {
      path: 'inscripciones/inscritos',
      component: VisualizacionComponent,
      data: { reportLabel: 'RteInscritos' },
      canActivate: [AuthGuard],
    },
    {
      path: 'inscripciones/aspirantes',
      component: VisualizacionComponent,
      data: { reportLabel: 'RteAspirantes' },
      canActivate: [AuthGuard],
    },
    {
      path: 'inscripciones/admitidos',
      component: VisualizacionComponent,
      data: { reportLabel: 'RteAdmitidos' },
      canActivate: [AuthGuard],
    },
    {
      path: 'transferencias/reingresos',
      component: VisualizacionComponent,
      data: { reportLabel: 'RteReingresosProd' },
      canActivate: [AuthGuard],
    },
    {
      path: 'transferencias/reingresos',
      component: VisualizacionComponent,
      data: { reportLabel: 'RteReingresosProd' },
      canActivate: [AuthGuard],
    },
    {
      path: 'transferencias/reingresos',
      component: VisualizacionComponent,
      data: { reportLabel: 'RteReingresosProd' },
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

export class EventoRoutingModule { }

export const routedComponents = [
  ReportesComponent,
];
