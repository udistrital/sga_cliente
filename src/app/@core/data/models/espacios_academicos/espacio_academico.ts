export class EspacioAcademico {
    readonly _id: string;
    nombre: string;
    codigo_abreviacion: string;
    codigo: string;
    plan_estudio_id: string;
    proyecto_academico_id: number;
    creditos: number;
    distribucion_horas: Object;
    tipo_espacio_id: number;
    clasificacion_espacio_id: number;
    enfoque_id: number;
    espacios_requeridos: Object[];
    grupo: string;
    inscritos: number;
    periodo_id: number;
    docente_id: number;
    horario_id: string;
    espacio_academico_padre: string = null;
    soporte_documental: Object[];
    estado_aprobacion_id: string;
    observacion: string;
    activo: boolean = true;
    readonly fecha_creacion: Date;
    fecha_modificacion: Date;
}