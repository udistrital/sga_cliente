export const FORMULARIO_SOLICITUD = {
    tipo_formulario: 'mini',
    alertas: true,
    nombre: "FORMULARIO_SOLICITUD",
    btn: 'Enviar respuesta',
    modelo: 'RespuestaSolicitudDerechos',
    campos: [
        {
            etiqueta: 'textarea',
            claseGrid: 'col-12',
            nombre: 'Observacion',
            label_i18n: 'observaciones',
            placeholder_i18n: 'observaciones',
            requerido: true,
            tipo: 'text',
        },
        {
            etiqueta: 'file',
            claseGrid: 'col-12',
            clase: 'form-control',
            nombre: 'DocRespuesta',
            label_i18n: 'adjuntar',
            requerido: true,
            tipo: 'pdf',
            tipoDocumento: 25,
            formatos: 'pdf',
            url: '',
            tamanoMaximo: 2,
        }
    ]
}