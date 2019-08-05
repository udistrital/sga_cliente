
export let FORM_METODO_HTTP = {
    titulo: 'MetodoHttp',
    tipo_formulario: 'mini',
    btn: 'Guardar',
    alertas: true,
    modelo: 'MetodoHttp',
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
        etiqueta: 'input',
        claseGrid: 'col-6',
        nombre: 'Descripcion',
        label_i18n: 'descripcion',
        placeholder_i18n: 'descripcion',
        requerido: true,
        tipo: 'text',
    },
    ],
}
