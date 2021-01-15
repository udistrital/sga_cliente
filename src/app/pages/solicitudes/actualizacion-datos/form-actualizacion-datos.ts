export const ACTUALIZAR_DATOS = {
    titulo: 'solicitud_encabezado',
    tipo_formulario: 'mini',
    modelo: 'solicitudDatos',
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
            etiqueta: 'select',
            tipo: 'text',
            nombre: 'TipoDocumentoActual',
            claseGrid: 'col-12 col-sm-6',
            label_i18n: 'documento_actual',
            requerido: true,
            opciones: [],
            key: 'Nombre',
        },
        {
            etiqueta: 'input',
            tipo: 'text',
            nombre: 'NumeroActual',
            claseGrid: 'col-12 col-sm-6',
            label_i18n: 'numero_actual',
            requerido: true,
        },
        {
            etiqueta: 'input',
            tipo: 'date',
            nombre: 'FechaExpedicionActual',
            claseGrid: 'col-12 col-sm-6',
            label_i18n: 'expedicion_actual',
            requerido: true,
        },
        {
            etiqueta: 'div',
            claseGrid: 'offset-sm-6'
        },
        {
            etiqueta: 'select',
            tipo: 'text',
            nombre: 'TipoDocumentoNuevo',
            claseGrid: 'col-12 col-sm-6',
            label_i18n: 'documento_nuevo',
            requerido: true,
            opciones: [],
            key: 'Nombre'
        },
        {
            etiqueta: 'input',
            tipo: 'text',
            nombre: 'NumeroNuevo',
            claseGrid: 'col-12 col-sm-6',
            label_i18n: 'numero_nuevo',
            requerido: true,
        },
        {
            etiqueta: 'input',
            tipo: 'date',
            nombre: 'FechaExpedicionNuevo',
            claseGrid: 'col-12 col-sm-6',
            label_i18n: 'expedicion_nuevo',
            requerido: true,
        },
        {
            etiqueta: 'div',
            claseGrid: 'offset-sm-6'
        },
        {
            etiqueta: 'button',
            tipo: 'button',
            nombre: 'SoporteIdentificacion',
            icono: 'fa fa-file-pdf-o fa-5x',
            claseBoton: 'mat-button float-right',
            claseGrid: 'col-6 align-self-center',
            label_i18n: 'soporte_id',
            requerido: true,
        },
    ]
}