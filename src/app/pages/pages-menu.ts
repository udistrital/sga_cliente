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
    title: 'Producción Academica',
    icon: 'nb-compose',
    link: '',
    key: 'produccion_academica',
    children: [
      {
        title: 'Listar Producciones',
        icon: 'nb-list',
        link: '/pages/produccion_academica/list-produccion_academica',
        key: 'list_produccion_academica',
      },
    ],
  },
  {
    title: 'Eventos',
    icon: 'nb-compose',
    link: '',
    key: 'evento',
    children: [
      {
        title: 'Listar Eventos',
        icon: 'nb-list',
        link: '/pages/evento/list-evento',
        key: 'list_evento',
      },
    ],
  },
  {
    title: 'Archivo Icfes',
    icon: 'nb-compose',
    link: '',
    key: 'archivo_icfes',
    children: [
      {
        title: 'Registrar archivo',
        icon: 'nb-list',
        link: '/pages/archivo_icfes/crud-archivo_icfes',
        key: 'crud_archivo',
      },
    ],
  },
  /*
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
  */
]
