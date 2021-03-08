export const DOCENTE_PRACTICA = {
    titulo: 'docente',
    tipo_formulario: 'mini',
    modelo: 'DocentePractica',
    campos: [
        {
            etiqueta: 'input',
            tipo: 'text',
            nombre: 'Nombre',
            claseGrid: 'col-12 col-sm-6 col-md-3',
            label_i18n: 'nombre',
            deshabilitar: true,
        },
        {
            etiqueta: 'input',
            tipo: 'text',
            nombre: 'Vinculacion',
            claseGrid: 'col-12 col-sm-6 col-md-3',
            label_i18n: 'vinculacion',
            deshabilitar: true,
        },
        {
            etiqueta: 'input',
            tipo: 'text',
            nombre: 'Correo',
            claseGrid: 'col-12 col-sm-6 col-md-3',
            label_i18n: 'correo',
            deshabilitar: true,
        },
        {
            etiqueta: 'input',
            tipo: 'text',
            nombre: 'Telefono',
            claseGrid: 'col-12 col-sm-6 col-md-3',
            label_i18n: 'telefono',
            deshabilitar: true,
        },
        {
            etiqueta: 'button',
            tipo: 'button',
            nombre: 'AgregarDocente',
            claseGrid: 'col-12 text-center',
            claseBoton: 'mat-button',
            label_i18n: 'agregar_docente',
            requerido: true,
        },
    ]
}