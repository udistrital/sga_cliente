export const ACTUALIZAR_NOMBRE = {
    titulo: 'solicitud_encabezado',
    tipo_formulario: 'mini',
    modelo: '',
    btn: 'enviar',
    campos: [
        {
            etiqueta: 'input',
            tipo: 'text',
            nombre: 'FechaSolicitud',
            claseGrid: 'col-12 col-sm-6',
            label_i18n: 'fecha',
            deshabilitar: true,
            requerido: true,
            valor : new Date().toLocaleDateString('es-CO'),
        },
        {
            etiqueta: 'div',
            claseGrid: 'offset-sm-6'
        },
        {
            etiqueta: 'label',
            claseGrid: 'col-12',
            label_i18n: 'nombre_actual'
        },
        {
            etiqueta: 'input',
            tipo: 'text',
            nombre: 'NombreActual',
            claseGrid: 'col-12 col-sm-6',
            label_i18n: 'nombre_',
            requerido: true,
        },
        {
            etiqueta: 'input',
            tipo: 'text',
            nombre: 'ApellidoActual',
            claseGrid: 'col-12 col-sm-6',
            label_i18n: 'apellido',
            requerido: true,
        },
        {
            etiqueta: 'label',
            claseGrid: 'col-12',
            label_i18n: 'nombre_nuevo'
        },
        {
            etiqueta: 'input',
            tipo: 'text',
            nombre: 'NombreNuevo',
            claseGrid: 'col-12 col-sm-6',
            label_i18n: 'nombre_',
            requerido: true,
        },
        {
            etiqueta: 'input',
            tipo: 'text',
            nombre: 'ApellidoNuevo',
            claseGrid: 'col-12 col-sm-6',
            label_i18n: 'apellido',
            requerido: true,
        },
        {
            etiqueta: 'button',
            tipo: 'button',
            nombre: 'SoporteNombre',
            icono: 'fa fa-file-pdf-o fa-5x',
            claseBoton: 'mat-button float-right',
            claseGrid: 'col-6 align-self-center',
            label_i18n: 'soporte_nombre',
            requerido: true,
        },
    ]
}