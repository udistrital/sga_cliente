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
