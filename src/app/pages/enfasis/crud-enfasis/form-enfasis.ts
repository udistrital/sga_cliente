
export let FORM_ENFASIS = {
    titulo: 'Enfasis',
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
        etiqueta: 'select',
        claseGrid: 'col-6',
        nombre: 'Aplicacion',
        label_i18n: 'aplicacion',
        placeholder_i18n: 'aplicacion',
        requerido: true,
        tipo: 'Aplicacion',
        key: 'Nombre',
        opciones: [],
    },
    ],
}
