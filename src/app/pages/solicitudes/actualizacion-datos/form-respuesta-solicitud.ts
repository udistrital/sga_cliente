export const RESPUESTA_SOLICITUD = {
    titulo: 'solicitud_respuesta',
    tipo_formulario: 'mini',
    modelo: 'solicitudRespuesta',
    btn: 'Enviar respuesta',
    campos: [
        {
            etiqueta: 'textarea',
            tipo: 'textarea',
            nombre: 'Observacion',
            claseGrid: 'col-lg-8 col-md-6 col-sm-12 col-xs-12',
            label_i18n: 'observacion',
            requerido: false,
            key: 'Valor',
        },
        {
            etiqueta: 'checkbox',
            tipo: 'checkbox',
            nombre: 'DocValido',
            claseGrid: 'col-lg-4 col-md-6 col-sm-12 col-xs-12',
            label_i18n: 'doc_valido',
            requerido: false,
            key: 'Valor',
        },
    ]
}