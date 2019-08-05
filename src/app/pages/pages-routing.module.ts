import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';

import { PagesComponent } from './pages.component';
import { DashboardComponent } from './dashboard/dashboard.component';

const routes: Routes = [{
  path: '',
  component: PagesComponent,
  children: [
    {
    path: 'dashboard',
    component: DashboardComponent,
    },
    {
    path: 'notificacion_estado',
    loadChildren: './notificacion_estado/notificacion_estado.module#NotificacionEstadoModule',
    },
    {
    path: 'metodo_http',
    loadChildren: './metodo_http/metodo_http.module#MetodoHttpModule',
    },
    {
    path: 'notificacion_tipo',
    loadChildren: './notificacion_tipo/notificacion_tipo.module#NotificacionTipoModule',
    },
    {
    path: 'aplicacion',
    loadChildren: './aplicacion/aplicacion.module#AplicacionModule',
    },
    {
    path: 'perfil',
    loadChildren: './perfil/perfil.module#PerfilModule',
    },
    {
    path: 'notificacion_configuracion',
    loadChildren: './notificacion_configuracion/notificacion_configuracion.module#NotificacionConfiguracionModule',
    },
    {
    path: 'notificacion',
    loadChildren: './notificacion/notificacion.module#NotificacionModule',
    },
    {
    path: 'notificacion_estado_usuario',
    loadChildren: './notificacion_estado_usuario/notificacion_estado_usuario.module#NotificacionEstadoUsuarioModule',
    },
    {
    path: 'parametro',
    loadChildren: './parametro/parametro.module#ParametroModule',
    },
    {
    path: 'notificacion_configuracion_perfil',
    loadChildren: './notificacion_configuracion_perfil/notificacion_configuracion_perfil.module#NotificacionConfiguracionPerfilModule',
    },
    {
    path: 'menu_opcion',
    loadChildren: './menu_opcion/menu_opcion.module#MenuOpcionModule',
    },
    {
    path: 'perfil_x_menu_opcion',
    loadChildren: './perfil_x_menu_opcion/perfil_x_menu_opcion.module#PerfilXMenuOpcionModule',
    },
    {
    path: 'menu_opcion_padre',
    loadChildren: './menu_opcion_padre/menu_opcion_padre.module#MenuOpcionPadreModule',
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

