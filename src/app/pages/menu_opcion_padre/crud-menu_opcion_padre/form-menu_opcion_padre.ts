
export let FORM_MENU_OPCION_PADRE = {
    titulo: 'MenuOpcionPadre',
    tipo_formulario: 'mini',
    btn: 'Guardar',
    alertas: true,
    modelo: 'MenuOpcionPadre',
    campos: [
    {
        etiqueta: 'select',
        claseGrid: 'col-6',
        nombre: 'Padre',
        label_i18n: 'padre',
        placeholder_i18n: 'padre',
        requerido: true,
        tipo: 'MenuOpcion',
        // key: 'Name',
        opciones: [],
    },
    {
        etiqueta: 'select',
        claseGrid: 'col-6',
        nombre: 'Hijo',
        label_i18n: 'hijo',
        placeholder_i18n: 'hijo',
        requerido: true,
        tipo: 'MenuOpcion',
        // key: 'Name',
        opciones: [],
    },
    ],
}
