import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ReportesComponent } from './reportes.component';
import { InscritosProyectoComponent } from './inscripciones/inscritos-proyecto/inscritos-proyecto.component';
import { AdmisionProyectoComponent } from './inscripciones/admision-proyecto/admision-proyecto.component';
import { ReporteProyectosListComponent } from './proyectos/list-proyectos/list-proyectos.component';
import { ReporteHistoricoAcreditacionesComponent } from './proyectos/historico-acreditaciones/historico-acreditaciones.component';
import {IcfesProyectoComponent} from './icfes_SNP/icfes-proyecto/icfes-proyecto.component';

const routes: Routes = [{
  path: '',
  component: ReportesComponent,
  children: [
    {
      path: 'inscripciones/inscritos-proyecto',
      component: InscritosProyectoComponent,
    },
    {
      path: 'inscripciones/admision-proyecto',
      component: AdmisionProyectoComponent,
    },
    {
      path: 'icfes_SNP/icfes-proyecto',
      component: IcfesProyectoComponent,
    },
    {
      path: 'proyectos/list-proyectos',
      component: ReporteProyectosListComponent,
    },
    {
      path: 'proyectos/historico-acreditaciones',
      component: ReporteHistoricoAcreditacionesComponent,
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
  InscritosProyectoComponent,
  AdmisionProyectoComponent,
  IcfesProyectoComponent,
  ReporteProyectosListComponent,
  ReporteHistoricoAcreditacionesComponent,
];
