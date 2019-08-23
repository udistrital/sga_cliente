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
      path: 'evento',
      loadChildren: './evento/evento.module#EventoModule',
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

