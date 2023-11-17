export class EspacioAcademicoDocentes {
    readonly _id: string;
    espacio_academico_id: string;
    docente_id: number;
    periodo_id: number;
    activo: boolean = true;
    readonly fecha_creacion: Date;
    fecha_modificacion: Date;
}