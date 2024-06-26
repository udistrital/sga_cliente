export let FORM_INFO_PERSONA = {
    // titulo: 'InfoPersona',
    tipo_formulario: 'mini',
    alertas: true,
    btn: 'Guardar',
    modelo: 'InfoPersona',
    campos: [
        {
            etiqueta: 'input',
            claseGrid: 'col-lg-6 col-md-6 col-sm-12 col-xs-12',
            nombre: 'PrimerNombre',
            label_i18n: 'primer_nombre',
            placeholder_i18n: 'primer_nombre',
            requerido: true,
            tipo: 'text',
        },
        {
            etiqueta: 'input',
            claseGrid: 'col-lg-6 col-md-6 col-sm-12 col-xs-12',
            nombre: 'SegundoNombre',
            label_i18n: 'segundo_nombre',
            placeholder_i18n: 'segundo_nombre',
            requerido: false,
            tipo: 'text',
        },
        {
            etiqueta: 'input',
            claseGrid: 'col-lg-6 col-md-6 col-sm-12 col-xs-12',
            nombre: 'PrimerApellido',
            label_i18n: 'primer_apellido',
            placeholder_i18n: 'primer_apellido',
            requerido: true,
            tipo: 'text',
        },
        {
            etiqueta: 'input',
            claseGrid: 'col-lg-6 col-md-6 col-sm-12 col-xs-12',
            nombre: 'SegundoApellido',
            label_i18n: 'segundo_apellido',
            placeholder_i18n: 'segundo_apellido',
            requerido: false,
            tipo: 'text',
        },
        {
            etiqueta: 'select',
            claseGrid: 'col-lg-6 col-md-6 col-sm-12 col-xs-12',
            nombre: 'TipoIdentificacion',
            label_i18n: 'tipo_documento',
            placeholder_i18n: 'tipo_documento',
            requerido: true,
            tipo: 'TipoIdentificacion',
            key: 'Nombre',
            opciones: [ ],
        },
        {
            etiqueta: 'input',
            claseGrid: 'col-lg-6 col-md-6 col-sm-12 col-xs-12',
            nombre: 'NumeroIdentificacion',
            label_i18n: 'numero_documento',
            placeholder_i18n: 'numero_documento',
            requerido: true,
            tipo: 'text',
        },
        {
            etiqueta: 'select',
            claseGrid: 'col-lg-4 col-md-6 col-sm-12 col-xs-12',
            nombre: 'EstadoCivil',
            label_i18n: 'estado_civil',
            placeholder_i18n: 'estado_civil',
            requerido: true,
            tipo: 'EstadoCivil',
            key: 'Nombre',
            opciones: [],
        },
        {
            etiqueta: 'select',
            claseGrid: 'col-lg-4 col-md-6 col-sm-12 col-xs-12',
            nombre: 'Genero',
            label_i18n: 'genero',
            placeholder_i18n: 'genero',
            requerido: true,
            tipo: 'Genero',
            key: 'Nombre',
            opciones: [],
        },
        {
            etiqueta: 'mat-date',
            claseGrid: 'col-lg-4 col-md-6 col-sm-12 col-xs-12',
            nombre: 'FechaNacimiento',
            label_i18n: 'fecha_nacimiento',
            placeholder_i18n: 'fecha_nacimiento',
            requerido: true,
            tipo: 'date',
        },

        {
            etiqueta: 'file',
            claseGrid: 'col-lg-6 col-md-6 col-sm-12 col-xs-12',
            clase: 'form-control',
            nombre: 'SoporteDocumento',
            label_i18n: 'documento_identificacion',
            placeholder_i18n: 'documento_identificacion',
            tipo: 'pdf',
            tipoDocumento: 2,
            formatos: 'pdf',
            url: '',
            tamanoMaximo: 2,
        },
        {
            etiqueta: 'file',
            claseGrid: 'col-lg-6 col-md-6 col-sm-12 col-xs-12',
            clase: 'form-control',
            nombre: 'Foto',
            label_i18n: 'foto',
            placeholder_i18n: 'foto',
            tipo: 'image',
            tipoDocumento: 1,
            formatos: 'png/jpg/jpeg',
            url: 'assets/images/foto.png',
            tamanoMaximo: 2,
        },
    ],
}