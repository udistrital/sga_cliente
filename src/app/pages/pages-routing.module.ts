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
      path: 'aplicacion',
      loadChildren: () => import('./aplicacion/aplicacion.module')
        .then(m => m.AplicacionModule )
    },
    {
      path: 'perfil',
      loadChildren: () => import('./perfil/perfil.module')
        .then(m => m.PerfilModule )
    },
    {
      path: 'notificacion_configuracion',
      loadChildren: () => import('./notificacion_configuracion/notificacion_configuracion.module')
        .then(m => m.NotificacionConfiguracionModule )
    },
    {
      path: 'notificacion_configuracion_perfil',
      loadChildren: () => import('./notificacion_configuracion_perfil/notificacion_configuracion_perfil.module')
      .then(m => m.NotificacionConfiguracionPerfilModule )
    },
    {
      path: 'menu_opcion',
      loadChildren: () => import('./menu_opcion/menu_opcion.module')
      .then(m => m.MenuOpcionModule )
    },
    {
      path: 'perfil_x_menu_opcion',
      loadChildren: () => import('./perfil_x_menu_opcion/perfil_x_menu_opcion.module')
      .then(m => m.PerfilXMenuOpcionModule )
    },
    // {
    //   path: 'notificacion',
    //   loadChildren: () => import('./notificacion/notificacion.module')
    //     .then(m => m.NotificacionModule )
    // },
    // {
    //   path: 'notificacion_estado',
    //   loadChildren: () => import('./notificacion_estado/notificacion_estado.module')
    //     .then(m => m.NotificacionEstadoModule )
    // },
    // {
    //   path: 'metodo_http',
    //   loadChildren: () => import('./metodo_http/metodo_http.module')
    //     .then(m => m.MetodoHttpModule )
    // },
    // {
    //   path: 'notificacion_tipo',
    //   loadChildren: () => import('./notificacion_tipo/notificacion_tipo.module')
    //     .then(m => m.NotificacionTipoModule )
    // },
    // {
    //   path: 'notificacion_estado_usuario',
    //   loadChildren: () => import('./notificacion_estado_usuario/notificacion_estado_usuario.module')
    //     .then(m => m.NotificacionEstadoUsuarioModule )
    // },
    // {
    //   path: 'parametro',
    //   loadChildren: () => import('./parametro/parametro.module')
    //     .then(m => m.ParametroModule )
    // },
    // {
    //   path: 'menu_opcion_padre',
    //   loadChildren: () => import('./menu_opcion_padre/menu_opcion_padre.module')
    //     .then(m => m.MenuOpcionPadreModule )
    // },
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

