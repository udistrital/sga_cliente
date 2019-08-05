
export let FORM_NOTIFICACION_CONFIGURACION_PERFIL = {
    titulo: 'NotificacionConfiguracionPerfil',
    tipo_formulario: 'mini',
    btn: 'Guardar',
    alertas: true,
    modelo: 'NotificacionConfiguracionPerfil',
    campos: [
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
    {
        etiqueta: 'select',
        claseGrid: 'col-6',
        nombre: 'Perfil',
        label_i18n: 'perfil',
        placeholder_i18n: 'perfil',
        requerido: true,
        tipo: 'Perfil',
        key: 'Nombre',
        opciones: [],
    },
    ],
}
