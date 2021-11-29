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
      loadChildren: () => import ('./archivo_icfes/archivo_icfes.module').then(m => m.ArchivoIcfesModule),
    },
    {
        path: 'dashboard',
        component: DashboardComponent,
    },
    {
      path: 'solicitudes',
      loadChildren: () => import ('./solicitudes/solicitudes.module').then(m => m.SolicitudesModule)
    },
    {
      path: 'solicitud',
      loadChildren: () => import ('./solicitudes/solicitudes.module').then(m => m.SolicitudesModule)
    },
    {
      path: 'practicas-academicas',
      loadChildren: () => import ('./practicas-academicas/practicas-academicas.module').then(m => m.PracticasAcademicasModule)
    },
    {
      path: 'espacios-academicos',
      loadChildren: () => import ('./espacios-academicos/espacios-academicos.module').then(m => m.EspaciosAcademicosModule)
    },
    {
      path: 'inscripcion',
      loadChildren: () => import ('./inscripcion/inscripcion.module').then(m => m.InscripcionModule),
    },
    {
      path: 'admision',
      loadChildren: () => import ('./admision/admision.module').then(m => m.AdmisionModule),
    },
    {
      path: 'evento',
      loadChildren: () => import ('./evento/evento.module').then(m => m.EventoModule),
    },
    {
      path: 'calendario-academico',
      loadChildren: () => import ('./calendario-academico/calendario-academico.module').then(m => m.CalendarioAcademicoModule),
    },
    {
      path: 'derechos-pecuniarios',
      loadChildren: () => import ('./derechos-pecuniarios/derechos-pecuniarios.module').then(m => m.DerechosPecuniariosModule),
    },
    {
        path: 'perfil',
        loadChildren: () => import ('./perfil/perfil.module').then(m => m.PerfilModule),
    },
    {
      path: 'produccion_academica',
      loadChildren: () => import ('./produccion_academica/produccion_academica.module').then(m => m.ProduccionAcademicaModule),
    },
    {
      path: 'reportes',
      loadChildren: () => import ('./reportes/reportes.module').then(m => m.ReportesModule),
    },
    {
      path: 'tipo_periodo',
      loadChildren: () => import ('./tipo_periodo/tipo_periodo.module').then(m => m.TipoPeriodoModule),
    },
    {
      path: 'periodo',
      loadChildren: () => import ('./periodo/periodo.module').then(m => m.PeriodoModule),
    },
    {
      path: 'calendarioevento',
      loadChildren: () => import ('./calendarioevento/calendarioevento.module').then(m => m.CalendarioeventoModule),
    },
    {
      path: 'proyecto_academico',
      loadChildren: () => import ('./proyecto_academico/proyecto_academico.module').then(m => m.ProyectoAcademicoModule),
    },
    {
      path: 'enfasis',
      loadChildren: () => import ('./enfasis/enfasis.module').then(m => m.EnfasisModule),
    },
    {
      path: 'tipo_inscripcion',
      loadChildren: () => import ('./tipo_inscripcion/tipo_inscripcion.module').then(m => m.TipoInscripcionModule),
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

