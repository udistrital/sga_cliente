import { FormParams } from "../../@core/data/models/define-form-fields";
import * as lo_ from "lodash";

export let FORM_PLAN_ESTUDIO: FormParams = {
    "nivel": {
        label_i18n: 'GLOBAL.nivel',
        placeholder_i18n: 'GLOBAL.nivel',
        tipo: 'select',
        tipoDato: 'text',
        requerido: true,
        soloLectura: false,
        valor: undefined,
        claseGrid: 'col-lg-6 col-md-6 col-sm-12 col-xs-12',
        opciones: [],
        notificar: true,
    },
    "subnivel": {
        label_i18n: 'GLOBAL.subnivel',
        placeholder_i18n: 'GLOBAL.subnivel',
        tipo: 'select',
        tipoDato: 'text',
        requerido: true,
        soloLectura: false,
        valor: undefined,
        claseGrid: 'col-lg-6 col-md-6 col-sm-12 col-xs-12',
        opciones: [],
        notificar: true,
    },
    "proyectoCurricular": {
        label_i18n: 'GLOBAL.proyecto_academico',
        placeholder_i18n: 'GLOBAL.proyecto_academico',
        tipo: 'select',
        tipoDato: 'text',
        requerido: true,
        soloLectura: false,
        valor: undefined,
        claseGrid: 'col-lg-6 col-md-6 col-sm-12 col-xs-12',
        opciones: [],
        notificar: true,
    },
    "codigoProyecto": {
        label_i18n: 'plan_estudios.codigo_proyecto',
        placeholder_i18n: 'plan_estudios.codigo_proyecto',
        tipo: 'input',
        tipoDato: 'text',
        requerido: false,
        soloLectura: true,
        valor: undefined,
        claseGrid: 'col-lg-3 col-md-3 col-sm-12 col-xs-12',
    },
    "planPorCiclos": {
        label_i18n: 'plan_estudios.plan_estudios_ciclos',
        placeholder_i18n: 'plan_estudios.plan_estudios_ciclos',
        tipo: 'input',
        tipoDato: 'text',
        requerido: false,
        soloLectura: true,
        valor: undefined,
        claseGrid: 'col-lg-3 col-md-3 col-sm-12 col-xs-12',
    },
    "nombrePlanEstudio": {
        label_i18n: 'plan_estudios.nombre_plan_estudios',
        placeholder_i18n: 'plan_estudios.nombre_plan_estudios',
        tipo: 'input',
        tipoDato: 'text',
        requerido: true,
        soloLectura: false,
        valor: undefined,
        claseGrid: 'col-lg-4 col-md-4 col-sm-12 col-xs-12',
    },
    "codigoPlanEstudio": {
        label_i18n: 'plan_estudios.codigo_plan',
        placeholder_i18n: 'plan_estudios.codigo_plan',
        tipo: 'input',
        tipoDato: 'text',
        requerido: true,
        soloLectura: false,
        valor: undefined,
        claseGrid: 'col-lg-4 col-md-4 col-sm-12 col-xs-12',
    },
    "totalCreditosPrograma": {
        label_i18n: 'plan_estudios.total_creditos',
        placeholder_i18n: 'plan_estudios.placeholder_total_creditos',
        tipo: 'input',
        tipoDato: 'number',
        minimo: 1,
        requerido: true,
        soloLectura: false,
        valor: undefined,
        claseGrid: 'col-lg-4 col-md-4 col-sm-12 col-xs-12',
    },
    "numeroSemestres": {
        label_i18n: 'plan_estudios.numero_semestres',
        placeholder_i18n: 'plan_estudios.placeholder_numero_semestres',
        tipo: 'input',
        tipoDato: 'number',
        minimo: 1,
        requerido: true,
        soloLectura: false,
        valor: undefined,
        claseGrid: 'col-lg-4 col-md-4 col-sm-12 col-xs-12',
    },
    "numeroResolucion": {
        label_i18n: 'plan_estudios.numero_resolucion',
        placeholder_i18n: 'plan_estudios.numero_resolucion',
        tipo: 'input',
        tipoDato: 'number',
        minimo: 0,
        requerido: true,
        soloLectura: false,
        valor: undefined,
        claseGrid: 'col-lg-4 col-md-4 col-sm-12 col-xs-12',
    },
    "anioResolucion": {
        label_i18n: 'plan_estudios.anio_resolucion',
        placeholder_i18n: 'plan_estudios.anio_resolucion',
        tipo: 'input',
        tipoDato: 'number',
        minimo: 1900,
        requerido: true,
        soloLectura: false,
        valor: undefined,
        claseGrid: 'col-lg-4 col-md-4 col-sm-12 col-xs-12',
    },
    "soportes": {
        label_i18n: 'plan_estudios.soporte_plan',
        placeholder_i18n: 'plan_estudios.placeholder_soporte_plan',
        tipo: 'fileMultiple',
        tipoDato: '',
        tipoArchivos: 'pdf',
        tamMBArchivos: 2,
        requerido: true,
        soloLectura: false,
        valor: undefined,
        claseGrid: 'col-lg-6 col-md-6 col-sm-12 col-xs-12',
        archivosLocal: [],
        archivosLinea: [],
        archivosDelete: [],
        validaArchivos: {errTipo: false, errTam: false},
    }
}

function getFormPlanEstudioEdicion(): FormParams {
    let formPlanEstudioEdicion = lo_.cloneDeep(FORM_PLAN_ESTUDIO);
    formPlanEstudioEdicion.nivel = {
        label_i18n: 'GLOBAL.nivel',
        placeholder_i18n: 'GLOBAL.nivel',
        tipo: 'input',
        tipoDato: 'text',
        requerido: false,
        soloLectura: true,
        valor: undefined,
        claseGrid: 'col-lg-6 col-md-6 col-sm-12 col-xs-12',
    };
    formPlanEstudioEdicion.subnivel = {
        label_i18n: 'GLOBAL.subnivel',
        placeholder_i18n: 'GLOBAL.subnivel',
        tipo: 'input',
        tipoDato: 'text',
        requerido: false,
        soloLectura: true,
        valor: undefined,
        claseGrid: 'col-lg-6 col-md-6 col-sm-12 col-xs-12',
    };
    formPlanEstudioEdicion.proyectoCurricular = {
        label_i18n: 'GLOBAL.proyecto_academico',
        placeholder_i18n: 'GLOBAL.proyecto_academico',
        tipo: 'input',
        tipoDato: 'text',
        requerido: false,
        soloLectura: true,
        valor: undefined,
        claseGrid: 'col-lg-6 col-md-6 col-sm-12 col-xs-12',
        opciones: [],
        notificar: true,
    };
    return formPlanEstudioEdicion;
}

function getFormPlanEstudioVisualizacion(): FormParams {
    let formPlanEstudioVisualizacion = lo_.cloneDeep(FORM_PLAN_ESTUDIO);
    formPlanEstudioVisualizacion.nivel = {
        label_i18n: 'GLOBAL.nivel',
        placeholder_i18n: 'GLOBAL.nivel',
        tipo: 'input',
        tipoDato: 'text',
        requerido: false,
        soloLectura: true,
        valor: undefined,
        claseGrid: 'col-lg-6 col-md-6 col-sm-12 col-xs-12',
    };
    formPlanEstudioVisualizacion.subnivel = {
        label_i18n: 'GLOBAL.subnivel',
        placeholder_i18n: 'GLOBAL.subnivel',
        tipo: 'input',
        tipoDato: 'text',
        requerido: false,
        soloLectura: true,
        valor: undefined,
        claseGrid: 'col-lg-6 col-md-6 col-sm-12 col-xs-12',
    };
    formPlanEstudioVisualizacion.proyectoCurricular = {
        label_i18n: 'GLOBAL.proyecto_academico',
        placeholder_i18n: 'GLOBAL.proyecto_academico',
        tipo: 'input',
        tipoDato: 'text',
        requerido: false,
        soloLectura: true,
        valor: undefined,
        claseGrid: 'col-lg-6 col-md-6 col-sm-12 col-xs-12',
        opciones: [],
        notificar: true,
    };
    for (const key in formPlanEstudioVisualizacion) {
        formPlanEstudioVisualizacion[key].soloLectura = true;
        formPlanEstudioVisualizacion[key].requerido = false;
    }
    return formPlanEstudioVisualizacion;
}

export let FORM_PLAN_ESTUDIO_EDICION: FormParams = getFormPlanEstudioEdicion();

export let FORM_PLAN_ESTUDIO_VISUALIZACION: FormParams = getFormPlanEstudioVisualizacion();