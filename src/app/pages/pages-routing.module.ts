import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';

import { PagesComponent } from './pages.component';
import { DashboardComponent } from './dashboard/dashboard.component';

const routes: Routes = [{
  path: '',
  component: PagesComponent,
  children: [
    {
      path: 'archivo_icfes',
      loadChildren: './archivo_icfes/archivo_icfes.module#ArchivoIcfesModule',
    },
    {
        path: 'dashboard',
        component: DashboardComponent,
    },
    {
      path: 'inscripcion',
      loadChildren: './inscripcion/inscripcion.module#InscripcionModule',
    },
    {
      path: 'admision',
      loadChildren: './admision/admision.module#AdmisionModule',
    },
    {
      path: 'evento',
      loadChildren: './evento/evento.module#EventoModule',
    },
    {
      path: 'calendario-academico',
      loadChildren: './calendario-academico/calendario-academico.module#CalendarioAcademicoModule',
    },
    {
      path: 'derechos-pecuniarios',
      loadChildren: './derechos-pecuniarios/derechos-pecuniarios.module#DerechosPecuniariosModule',
    },
    {
        path: 'perfil',
        loadChildren: './perfil/perfil.module#PerfilModule',
    },
    {
      path: 'produccion_academica',
      loadChildren: './produccion_academica/produccion_academica.module#ProduccionAcademicaModule',
    },
    {
      path: 'reportes',
      loadChildren: './reportes/reportes.module#ReportesModule',
    },
    {
      path: 'tipo_periodo',
      loadChildren: './tipo_periodo/tipo_periodo.module#TipoPeriodoModule',
    },
    {
      path: 'periodo',
      loadChildren: './periodo/periodo.module#PeriodoModule',
    },
    {
      path: 'calendarioevento',
      loadChildren: './calendarioevento/calendarioevento.module#CalendarioeventoModule',
    },
    {
      path: 'proyecto_academico',
      loadChildren: './proyecto_academico/proyecto_academico.module#ProyectoAcademicoModule',
    },
    {
      path: 'enfasis',
      loadChildren: './enfasis/enfasis.module#EnfasisModule',
    },
    {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
    },
  ],
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PagesRoutingModule {
}

