
export let FORM_NOTIFICACION = {
    titulo: 'Notificacion',
    tipo_formulario: 'mini',
    btn: 'Guardar',
    alertas: true,
    modelo: 'Notificacion',
    campos: [
    {
        etiqueta: 'mat-date',
        claseGrid: 'col-6',
        nombre: 'FechaCreacion',
        label_i18n: 'fecha_creacion',
        placeholder_i18n: 'fecha_creacion',
        requerido: true,
        tipo: 'date',
    },
    {
        etiqueta: 'input',
        claseGrid: 'col-6',
        nombre: 'CuerpoNotificacion',
        label_i18n: 'cuerpo_notificacion',
        placeholder_i18n: 'cuerpo_notificacion',
        requerido: true,
        tipo: 'text',
    },
    {
        etiqueta: 'select',
        claseGrid: 'col-6',
        nombre: 'NotificacionConfiguracion',
        label_i18n: 'notificacion_configuracion',
        placeholder_i18n: 'notificacion_configuracion',
        requerido: true,
        tipo: 'NotificacionConfiguracion',
        key: 'EndPoint',
        opciones: [],
    },
    ],
}
