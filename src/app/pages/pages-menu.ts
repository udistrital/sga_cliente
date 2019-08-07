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
]
