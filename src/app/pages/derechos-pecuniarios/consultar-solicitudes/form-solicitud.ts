export const FORMULARIO_SOLICITUD = {
    tipo_formulario: 'mini',
    btn: 'Enviar respuesta',
    alertas: true,
    modelo: 'data',
    customPadding: '0',
    campos: [
        {
            etiqueta: 'textarea',
            claseGrid: 'col-12',
            nombre: 'Observaciones',
            label_i18n: 'observaciones',
            placeholder_i18n: 'observaciones',
            requerido: true,
            tipo: 'text',
        },
        {
            etiqueta: 'file',
            claseGrid: 'col-12',
            nombre: 'File',
            label_i18n: 'adjuntar',
            placeholder_i18n: 'adjuntar',
            requerido: true,
            tipo: 'text',
        }
    ]
}