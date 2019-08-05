// import { NbMenuItem } from '@nebular/theme';
import { MenuItem } from './menu-item';

export const MENU_ITEMS: MenuItem[] = [
  {
    title: 'Dashboard',
    icon: 'nb-home',
    link: '/pages/dashboard',
    home: true,
    key: 'dashboard',
  },
  // {
  //   title: 'Notificacion Estado',
  //   icon: 'nb-compose',
  //   link: '/pages/notificacion_estado',
  //   key: 'notificacion_estado',
  //   children: [
  //     {
  //       title: 'Lista Notificacion Estado',
  //       link: '/pages/notificacion_estado/list-notificacion_estado',
  //       key: 'lista_notificacion_estado',
  //     },
  //     {
  //       title: 'CRUD Notificacion Estado',
  //       link: '/pages/notificacion_estado/crud-notificacion_estado',
  //       key: 'crud_notificacion_estado',
  //     },
  //   ],
  // },
  // {
  //   title: 'Metodo Http',
  //   icon: 'nb-compose',
  //   link: '/pages/metodo_http',
  //   key: 'metodo_http',
  //   children: [
  //     {
  //       title: 'Lista Metodo Http',
  //       link: '/pages/metodo_http/list-metodo_http',
  //       key: 'lista_metodo_http',
  //     },
  //     {
  //       title: 'CRUD Metodo Http',
  //       link: '/pages/metodo_http/crud-metodo_http',
  //       key: 'crud_metodo_http',
  //     },
  //   ],
  // },
  // {
  //   title: 'Notificacion Tipo',
  //   icon: 'nb-compose',
  //   link: '/pages/notificacion_tipo',
  //   key: 'notificacion_tipo',
  //   children: [
  //     {
  //       title: 'Lista Notificacion Tipo',
  //       link: '/pages/notificacion_tipo/list-notificacion_tipo',
  //       key: 'lista_notificacion_tipo',
  //     },
  //     {
  //       title: 'CRUD Notificacion Tipo',
  //       link: '/pages/notificacion_tipo/crud-notificacion_tipo',
  //       key: 'crud_notificacion_tipo',
  //     },
  //   ],
  // },
  {
    title: 'Menú',
    icon: 'nb-compose',
    link: '',
    key: 'menu',
    children: [
      {
        title: 'Opciones',
        icon: 'nb-list',
        link: '/pages/menu_opcion/list-menu_opcion',
        key: 'opciones',
      },
      {
        title: 'Configurar rol',
        icon: 'nb-list',
        link: '/pages/perfil_x_menu_opcion/list-perfil_x_menu_opcion',
        key: 'configurar_rol',
      },
    ],
  },
  {
    title: 'General',
    icon: 'nb-compose',
    link: '',
    key: 'general',
    children: [
      {
        title: 'Aplicacion',
        icon: 'nb-list',
        link: '/pages/aplicacion/list-aplicacion',
        key: 'aplicaciones',
      },
      {
        title: 'Roles',
        icon: 'nb-list',
        link: '/pages/perfil/list-perfil',
        key: 'roles',
      },
    ],
  },

  // {
  //   title: 'Notificacion Configuracion',
  //   icon: 'nb-compose',
  //   link: '/pages/notificacion_configuracion',
  //   key: 'notificacion_configuracion',
  //   children: [
  //     {
  //       title: 'Lista Notificacion Configuracion',
  //       link: '/pages/notificacion_configuracion/list-notificacion_configuracion',
  //       key: 'lista_notificacion_configuracion',
  //     },
  //     {
  //       title: 'CRUD Notificacion Configuracion',
  //       link: '/pages/notificacion_configuracion/crud-notificacion_configuracion',
  //       key: 'crud_notificacion_configuracion',
  //     },
  //   ],
  // },
  {
    title: 'Notificacion',
    icon: 'nb-compose',
    link: '/pages/notificacion',
    key: 'notificacion',
    children: [
      {
        title: 'Lista Notificacion Configuracion',
        icon: 'nb-list',
        link: '/pages/notificacion_configuracion/list-notificacion_configuracion',
        key: 'lista_notificacion_configuracion',
      },
      {
        title: 'Lista Notificacion Configuracion Perfil',
        icon: 'nb-list',
        link: '/pages/notificacion_configuracion_perfil/list-notificacion_configuracion_perfil',
        key: 'lista_notificacion_configuracion_perfil',
      },
      {
        title: 'Lista Notificacion',
        icon: 'nb-list',
        link: '/pages/notificacion/list-notificacion',
        key: 'lista_notificacion',
      },
      {
        title: 'Lista Notificacion Estado Usuario',
        icon: 'nb-list',
        link: '/pages/notificacion_estado_usuario/list-notificacion_estado_usuario',
        key: 'lista_notificacion_estado_usuario',
      },
    ],
  },
  // {
  //   title: 'Notificacion',
  //   icon: 'nb-compose',
  //   link: '/pages/notificacion',
  //   key: 'notificacion',
  //   children: [
  //     {
  //       title: 'Lista Notificacion',
  //       link: '/pages/notificacion/list-notificacion',
  //       key: 'lista_notificacion',
  //     },
  //     {
  //       title: 'CRUD Notificacion',
  //       link: '/pages/notificacion/crud-notificacion',
  //       key: 'crud_notificacion',
  //     },
  //   ],
  // },
  // {
  //   title: 'Notificacion Estado Usuario',
  //   icon: 'nb-compose',
  //   link: '/pages/notificacion_estado_usuario',
  //   key: 'notificacion_estado_usuario',
  //   children: [
  //     {
  //       title: 'Lista Notificacion Estado Usuario',
  //       link: '/pages/notificacion_estado_usuario/list-notificacion_estado_usuario',
  //       key: 'lista_notificacion_estado_usuario',
  //     },
  //     {
  //       title: 'CRUD Notificacion Estado Usuario',
  //       link: '/pages/notificacion_estado_usuario/crud-notificacion_estado_usuario',
  //       key: 'crud_notificacion_estado_usuario',
  //     },
  //   ],
  // },
  // {
  //   title: 'Parametro',
  //   icon: 'nb-compose',
  //   link: '/pages/parametro',
  //   key: 'parametro',
  //   children: [
  //     {
  //       title: 'Lista Parametro',
  //       link: '/pages/parametro/list-parametro',
  //       key: 'lista_parametro',
  //     },
  //     {
  //       title: 'CRUD Parametro',
  //       link: '/pages/parametro/crud-parametro',
  //       key: 'crud_parametro',
  //     },
  //   ],
  // },
  // {
  //   title: 'Notificacion Configuracion Perfil',
  //   icon: 'nb-compose',
  //   link: '/pages/notificacion_configuracion_perfil',
  //   key: 'notificacion_configuracion_perfil',
  //   children: [
  //     {
  //       title: 'Lista Notificacion Configuracion Perfil',
  //       link: '/pages/notificacion_configuracion_perfil/list-notificacion_configuracion_perfil',
  //       key: 'lista_notificacion_configuracion_perfil',
  //     },
  //     {
  //       title: 'CRUD Notificacion Configuracion Perfil',
  //       link: '/pages/notificacion_configuracion_perfil/crud-notificacion_configuracion_perfil',
  //       key: 'crud_notificacion_configuracion_perfil',
  //     },
  //   ],
  // },

  // {
  //   title: 'Perfil X Menu Opcion',
  //   icon: 'nb-compose',
  //   link: '/pages/perfil_x_menu_opcion',
  //   key: 'perfil_x_menu_opcion',
  //   children: [
  //     {
  //       title: 'Lista Perfil X Menu Opcion',
  //       link: '/pages/perfil_x_menu_opcion/list-perfil_x_menu_opcion',
  //       key: 'lista_perfil_x_menu_opcion',
  //     },
  //     {
  //       title: 'CRUD Perfil X Menu Opcion',
  //       link: '/pages/perfil_x_menu_opcion/crud-perfil_x_menu_opcion',
  //       key: 'crud_perfil_x_menu_opcion',
  //     },
  //   ],
  // },
  // {
  //   title: 'Menu Opcion Padre',
  //   icon: 'nb-compose',
  //   link: '/pages/menu_opcion_padre',
  //   key: 'menu_opcion_padre',
  //   children: [
  //     {
  //       title: 'Lista Menu Opcion Padre',
  //       link: '/pages/menu_opcion_padre/list-menu_opcion_padre',
  //       key: 'lista_menu_opcion_padre',
  //     },
  //     {
  //       title: 'CRUD Menu Opcion Padre',
  //       link: '/pages/menu_opcion_padre/crud-menu_opcion_padre',
  //       key: 'crud_menu_opcion_padre',
  //     },
  //    ],
  // },
]
