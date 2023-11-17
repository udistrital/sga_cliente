export class EspacioAcademicoEstudiantes {
    readonly _id: string;
    espacio_academico_id: string;
    estudiante_id: number;
    periodo_id: number;
    activo: boolean = true;
    readonly fecha_creacion: Date;
    fecha_modificacion: Date;
}