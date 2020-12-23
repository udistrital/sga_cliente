
export let FORM_TIPO_INSCRIPCION = {
    titulo: 'TipoInscripcion',
    tipo_formulario: 'mini',
    btn: 'Guardar',
    alertas: true,
    modelo: 'TipoInscripcion',
    campos: [
        {
            etiqueta: 'input',
            claseGrid: 'col-6',
            nombre: 'Nombre',
            label_i18n: 'nombre_inscripcion',
            placeholder_i18n: 'nombre_inscripcion',
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
        {
            etiqueta: 'input',
            claseGrid: 'col-6',
            nombre: 'CodigoAbreviacion',
            label_i18n: 'codigo_abreviacion',
            placeholder_i18n: 'codigo_abreviacion',
            requerido: true,
            tipo: 'text',
        },
        {
            etiqueta: 'checkbox',
            claseGrid: 'col-6',
            nombre: 'Activo',
            label_i18n: 'activo',
            tipo: 'checkbox',
        },
        {
            etiqueta: 'checkbox',
            claseGrid: 'col-6',
            nombre: 'Especial',
            label_i18n: 'cupos_especiales',
            tipo: 'checkbox',
        },
        {
            etiqueta: 'input',
            claseGrid: 'col-6',
            nombre: 'NumeroOrden',
            label_i18n: 'numero_orden',
            placeholder_i18n: 'numero_orden',
            requerido: true,
            tipo: 'number',
        },
        {
            etiqueta: 'select',
            claseGrid: 'col-6',
            nombre: 'Nivel',
            label_i18n: 'nivel',
            placeholder_i18n: 'nivel',
            requerido: true,
            tipo: "any",
            key: 'Nombre',
            opciones: [{
                'Id': 14, 'Nombre': 'Pregrado'
            },
            {
                'Id': 15, 'Nombre': 'Posgrado'
            },
            ],
        },
    ],
}
