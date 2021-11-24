// import { NbMenuItem } from '@nebular/theme';
import { MenuItem } from './menu-item';
import { icon } from 'leaflet';

export const MENU_ITEMS: MenuItem[] = [
  {
    title: 'Dashboard',
    icon: 'home',
    link: '/pages/dashboard',
    home: true,
    key: 'dashboard',
  },
  {
    title: 'Solicitudes',
    icon: 'list',
    link: '',
    key: 'solicitudes',
    children: [
      {
        title: 'Lista de solicitudes',
        icon: 'list',
        link: '/pages/solicitudes/list-solicitudes-estudiante',
        key: 'solicitudes_lista',
      },
    ],
  },
  {
    title: 'Solicitud',
    icon: 'loop',
    link: '',
    key: 'solicitud',
    children: [
      {
        title: 'Actualizar datos',
        icon: 'list',
        link: '/pages/solicitud/ver-solicitudes',
        key: 'actualizacion',
      },
    ],
  },
  {
    title: 'Gestionar solicitudes',
    icon: 'compose',
    link: '',
    key: 'gestionar_solicitudes',
    children: [
      {
        title: 'Solicitudes de actualización',
        icon: 'list',
        link: '/pages/solicitudes/gestionar-solicitudes',
        key: 'solicitudes_actualizacion',
      },
    ],
  },
  {
    title: 'Espacios académicos',
    icon: 'list',
    link: '',
    key: 'espacios_academicos',
    children: [
      {
        title: 'Preinscripcion espacios',
        icon: 'list',
        link: '/pages/espacios-academicos',
        key: 'preinscripcion_espacios',
      },
    ],
  },
/*   {
    title: 'Producción Academica',
    icon: 'edit',
    link: '',
    key: 'produccion_academica',
    children: [
      {
        title: 'Listar Producciones',
        icon: 'list',
        link: '/pages/produccion_academica/list-produccion_academica',
        key: 'list_produccion_academica',
      },
    ],
  }, */
/*   {
    title: 'Eventos',
    icon: 'compose',
    link: '',
    key: 'evento',
    children: [
      {
        title: 'Listar Eventos',
        icon: 'list',
        link: '/pages/evento/list-evento',
        key: 'list_evento',
      },
    ],
  }, */
  {
    title: 'Calendario académico',
    icon: 'compose',
    link: '',
    key: 'calendarioacademico',
    children: [
      {
        title: 'Listar calendarios académicos',
        icon: 'list',
        link: '/pages/calendario-academico/list-calendario-academico',
        key: 'list_calendarioacademico',
      },
      {
        title: 'Calendario académico por proyecto',
        icon: 'search',
        link: '/pages/calendario-academico/calendario-proyecto',
        key: 'buscar_calendario_proyecto',
      },
    ],
  },
  {
    title: 'Prácticas académicas',
    icon: 'compose',
    link: '',
    key: 'practicas_academicas',
    children: [
      {
        title: 'Nueva solicitud',
        icon: 'compose',
        link: '/pages/practicas-academicas/nueva-solicitud',
        key: 'crear_nueva_practica',
      },
      {
        title: 'Nuevas solicitudes',
        icon: 'list',
        link: '/pages/practicas-academicas/lista-practicas',
        key: 'ver_nuevas_solicitudes',
      },
      {
        title: 'Solicitudes en proceso',
        icon: 'list',
        link: '/pages/practicas-academicas/lista-practicas',
        key: 'en_proceso',
      },
      {
        title: 'Invitacion',
        icon: 'edit',
        link: '',
        key: 'invitacion',
      },
    ],
  },
/*   {
    title: 'Tipo Periodo',
    icon: 'compose',
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
  }, */
  {
    title: 'Periodo',
    icon: 'gear',
    link: '/pages/periodo',
    key: 'periodo',
    children: [
      {
        title: 'Lista Periodo',
        icon: 'list',
        link: '/pages/periodo/list-periodo',
        key: 'lista_periodo',
      },
      {
        title: 'CRUD Periodo',
        icon: 'edit',
        link: '/pages/periodo/crud-periodo',
        key: 'crud_periodo',
      },
    ],
  },
/*   {
    title: 'Calendarioevento',
    icon: 'compose',
    link: '/pages/calendarioevento',
    key: 'calendarioevento',
    children: [
      {
        title: 'Lista Calendarioevento',
        link: '/pages/calendarioevento/list-calendarioevento',
        key: 'lista_calendarioevento',
      },
      {
        title: 'CRUD Calendarioevento',
        link: '/pages/calendarioevento/crud-calendarioevento',
        key: 'crud_calendarioevento',
      },
    ],
  }, */
  {
    title: 'Proyecto Academico',
    icon: 'edit',
    link: '',
    key: 'proyecto_academico',
    children: [
      {
        title: 'Registro de un Proyecto',
        icon: 'edit',
        link: '/pages/proyecto_academico/crud-proyecto_academico',
        key: 'crud_proyecto_academico',
      },
      {
        title: 'Listar Proyectos',
        icon: 'list',
        link: '/pages/proyecto_academico/list-proyecto_academico',
        key: 'list_proyecto_academico',
      },
    ],
  },
  {
    title: 'Inscripcion',
    icon: 'compose',
    link: '',
    key: 'inscripcion',
    children: [
      {
        title: 'Pre Inscripcion',
        icon: 'edit',
        link: '/pages/inscripcion/preinscripcion',
        key: 'preinscripcion',
      },
    ],
  },
  {
    title: 'Admision',
    icon: 'compose',
    link: '',
    key: 'admision',
    children: [
      {
        title: 'Asignación de documentos y descuentos por proyecto',
        icon: 'list',
        link: '/pages/admision/asignar_documentos_descuentos',
        key: 'documentos_descuentos',
      },
      {
        title: 'Administrar criterios',
        icon: 'list',
        link: '/pages/admision/administrar-criterios',
        key: 'administrar_criterios',
      },
      {
        title: 'Criterios admisión',
        icon: 'edit',
        link: '/pages/admision/criterio_admision',
        key: 'criterios',
      },
      // {
      //   title: 'Asignacion Cupos',
      //   icon: 'edit',
      //   link: '/pages/admision/asignacion_cupos',
      //   key: 'asignacion_cupos',
      // },
      // {
      //   title: 'Actualizacion Estado',
      //   icon: 'compose',
      //   link: '/pages/admision/actualizacion_estado',
      //   key: 'actualizacion_estado',
      // },
      {
        title: 'Listado Aspirante',
        icon: 'compose',
        link: '/pages/admision/listado_aspirante',
        key: 'listado_aspirante',
      },
      {
        title: 'Actualizacion Estado',
        icon: 'compose',
        link: '/pages/admision/asignacion_cupos',
        key: 'actualizacion_estado',
      },
      {
        title: 'Evaluación de documentos de inscritos',
        icon: 'edit',
        link: '/pages/admision/evaluacion-documentos-inscritos',
        key: 'evaluacion_documentos',
      },
      {
        title: 'Evaluación de aspirantes',
        icon: 'edit',
        link: '/pages/admision/evaluacion-aspirantes',
        key: 'evaluacion_aspirantes',
      },
    ],
  },
  {
    title: 'Derechos Pecuniarios',
    icon: 'compose',
    link: '',
    key: 'derechos_pecuniarios',
    children: [
      {
        title: 'Consultar conceptos',
        icon: 'list',
        link: '/pages/derechos-pecuniarios/consultar-conceptos',
        key: 'consultar_conceptos',
      },
      {
        title: 'Definir Conceptos',
        icon: 'compose',
        link: '/pages/derechos-pecuniarios/crud-derechos-pecuniarios',
        key: 'definir_conceptos',
      },
      {
        title: 'Asignar valores',
        icon: 'bar-chart',
        link: '/pages/derechos-pecuniarios/list-derechos-pecuniarios',
        key: 'asignar_valores',
      },
    ],
  },
  {
    title: 'Archivo Icfes',
    icon: 'compose',
    link: '',
    key: 'archivo_icfes',
    children: [
      {
        title: 'Registrar archivo',
        icon: 'list',
        link: '/pages/archivo_icfes/crud-archivo_icfes',
        key: 'crud_archivo',
      },
    ],
  },
  {
    title: 'Reportes',
    icon: 'compose',
    link: '',
    key: 'reportes',
    children: [
      {
        title: 'Inscripciones',
        icon: '	maximize',
        link: '',
        key: 'inscripciones',
        children: [
          {
            title: 'Inscritos por proyecto',
            icon: 'list',
            link: '/pages/reportes/inscripciones/inscritos-proyecto',
            key: 'inscritos_por_proyecto',
          },
          {
            title: 'Admitidos por proyecto',
            icon: 'list',
            link: '/pages/reportes/inscripciones/admision-proyecto',
            key: 'admision_por_proyecto',
          },
        ],
      },
      {
        title: 'Icfes',
        icon: '	maximize',
        link: '',
        key: 'icfes',
        children: [
          {
            title: 'Registro Icfes por proyecto',
            icon: 'list',
            link: '/pages/reportes/icfes_SNP/icfes-proyecto',
            key: 'icfes_por_proyecto',
          },
        ],
      },
      {
        title: 'Proyectos',
        icon: '	maximize',
        link: '',
        key: 'proyectos_curriculares',
        children: [
          {
            title: 'Proyectos',
            icon: 'list',
            link: '/pages/reportes/proyectos/list-proyectos',
            key: 'lista_proyectos_curriculares',
          },
          {
            title: 'HistoricoAcreditaciones',
            icon: 'list',
            link: '/pages/reportes/proyectos/historico-acreditaciones',
            key: 'historico_acreditaciones',
          },
        ],
      },
    ],
  },
  {
    title: 'Administración',
    icon: 'gear',
    link: '',
    key: 'administracion',
    children: [
      {
        title: 'enfasis',
        icon: 'compose',
        link: '',
        key: 'enfasis',
        children: [
          {
            title: 'Registrar Enfásis',
            icon: 'list',
            link: '/pages/enfasis/crud-enfasis',
            key: 'crud_enfasis',
          },
          {
            title: 'Listar Enfásis',
            icon: 'list',
            link: '/pages/enfasis/list-enfasis',
            key: 'list_enfasis',
          },
        ],
      },
      {
        title: 'Tipo Inscripción',
        icon: 'compose',
        link: '/pages/tipo_inscripcion/list-tipo_inscripcion',
        key: 'tipo_inscripcion',
      },
    ],
  },

  /*
  {
    title: 'Menú',
    icon: 'compose',
    link: '',
    key: 'menu',
    children: [
      {
        title: 'Opciones',
        icon: 'list',
        link: '/pages/menu_opcion/list-menu_opcion',
        key: 'opciones',
      },
      {
        title: 'Configurar rol',
        icon: 'list',
        link: '/pages/perfil_x_menu_opcion/list-perfil_x_menu_opcion',
        key: 'configurar_rol',
      },
    ],
  },
  */
]
