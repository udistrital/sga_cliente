export let FORM_INFO_DOCENTE = {
    titulo_i18n: 'ptd.info_docente',
    tipo_formulario: 'mini',
    alertas: false,
    modelo: 'InfoDocente',
    customPadding: '0',
    campos: [
      {
        etiqueta: 'input',
        claseGrid: 'col-lg-6 col-md-6 col-sm-12 col-xs-12',
        nombre: 'Nombre',
        label_i18n: 'GLOBAL.nombre',
        placeholder_i18n: 'practicas_academicas.placeholder_nombre',
        requerido: false,
        tipo: 'text',
      },
      {
        etiqueta: 'input',
        claseGrid: 'col-lg-6 col-md-6 col-sm-12 col-xs-12',
        nombre: 'Documento',
        label_i18n: 'GLOBAL.Documento',
        placeholder_i18n: 'practicas_academicas.placeholder_docDocente',
        requerido: false,
        tipo: 'text',
      },
      {
        etiqueta: 'input',
        claseGrid: 'col-lg-6 col-md-6 col-sm-12 col-xs-12',
        nombre: 'Periodo',
        label_i18n: 'calendario.periodo',
        placeholder_i18n: 'practicas_academicas.placeholder_periodo',
        requerido: false,
        tipo: 'text',
      },
    ],
  }
  