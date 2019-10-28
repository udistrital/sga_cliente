// import { NbMenuItem } from '@nebular/theme';
import { MenuItem } from './menu-item';
import { icon } from 'leaflet';

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
  {
    title: 'Tipo Periodo',
    icon: 'nb-compose',
    link: '/pages/tipo_periodo',
    key: 'tipo_periodo',
    children: [
      {
        title: 'Lista Tipo Periodo',
        link: '/pages/tipo_periodo/list-tipo_periodo',
        key: 'lista_tipo_periodo',
      },
      {
        title: 'CRUD Tipo Periodo',
        link: '/pages/tipo_periodo/crud-tipo_periodo',
        key: 'crud_tipo_periodo',
      },
    ],
  },
  {
    title: 'Periodo',
    icon: 'nb-compose',
    link: '/pages/periodo',
    key: 'periodo',
    children: [
      {
        title: 'Lista Periodo',
        link: '/pages/periodo/list-periodo',
        key: 'lista_periodo',
      },
      {
        title: 'CRUD Periodo',
        link: '/pages/periodo/crud-periodo',
        key: 'crud_periodo',
      },
    ],
  },
  {
    title: 'Calendarioevento',
    icon: 'nb-compose',
    link: '/pages/calendarioevento',
    key: 'calendarioevento',
    children: [
      {
        title: 'Lista Calendarioevento',
        link: '/pages/calendarioevento/list-calendarioevento',
        key: 'lista_calendarioevento',
      },
      // {
      //   title: 'CRUD Calendarioevento',
      //   link: '/pages/calendarioevento/crud-calendarioevento',
      //   key: 'crud_calendarioevento',
      // },
    ],
  },
  {
    title: 'Proyecto Academico',
    icon: 'nb-compose',
    link: '',
    key: 'proyecto_academico',
    children: [
      {
        title: 'Registro de un Proyecto',
        icon: 'nb-compose',
        link: '/pages/proyecto_academico/crud-proyecto_academico',
        key: 'crud_proyecto_academico',
      },
      {
        title: 'Listar Proyectos',
        icon: 'nb-list',
        link: '/pages/proyecto_academico/list-proyecto_academico',
        key: 'list_proyecto_academico',
      },
    ],
  },
  {
    title: 'Reportes',
    icon: 'nb-compose',
    link: '',
    key: 'reportes',
    children: [
      {
        title: 'Inscripciones',
        icon: '	nb-maximize',
        link: '',
        key: 'inscripciones',
        children: [
          {
            title: 'Inscritos por proyecto',
            icon: 'nb-list',
            link: '/pages/reportes/inscripciones/inscritos-proyecto',
            key: 'inscritos_por_proyecto',
          },
        ],
      },
    ],
  },
  {
    title: 'Administración',
    icon: 'nb-gear',
    link: '',
    key: 'administracion',
    children: [
      {
        title: 'enfasis',
        icon: 'nb-compose',
        link: '',
        key: 'enfasis',
        children: [
          {
            title: 'Registrar Enfásis',
            icon: 'nb-list',
            link: '/pages/enfasis/crud-enfasis',
            key: 'crud_enfasis',
          },
          {
            title: 'Listar Enfásis',
            icon: 'nb-list',
            link: '/pages/enfasis/list-enfasis',
            key: 'list_enfasis',
          },
        ],
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
