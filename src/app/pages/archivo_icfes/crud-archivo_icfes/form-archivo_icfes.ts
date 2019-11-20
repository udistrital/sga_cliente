
export let FORM_ARCHIVO_ICFES = {
    titulo: 'ArchivoIcfes',
    tipo_formulario: 'mini',
    btn: 'Guardar',
    alertas: true,
    modelo: 'Perfil',
    campos: [
    {
        etiqueta: 'input',
        claseGrid: 'col-6',
        nombre: 'Nombre',
        label_i18n: 'nombre',
        placeholder_i18n: 'nombre',
        requerido: true,
        tipo: 'text',
    },
    {
        etiqueta: 'file',
        claseGrid: 'col-lg-6 col-md-6 col-sm-12 col-xs-12',
        clase: 'form-control',
        nombre: 'SoporteDocumento',
        label_i18n: 'soporte_documento',
        placeholder_i18n: 'soporte_documento',
        requerido: true,
        tipo: 'txt',
        tipoDocumento: 2,
        formatos: 'txt',
        url: '',
        tamanoMaximo: 2,
    },
    ],
}
