import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ReportesComponent } from './reportes.component';
import { VisualizacionComponent } from './visualizacion/visualizacion.component';

const routes: Routes = [{
  path: '',
  component: ReportesComponent,
  children: [
    {
      path: 'inscripciones/inscritos',
      component: VisualizacionComponent,
      data: { reportLabel: 'RteInscritos' },
    },
    {
      path: 'inscripciones/aspirantes',
      component: VisualizacionComponent,
      data: { reportLabel: 'RteAspirantes' },
    },
    {
      path: 'inscripciones/admitidos',
      component: VisualizacionComponent,
      data: { reportLabel: 'RteAdmitidos' },
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
