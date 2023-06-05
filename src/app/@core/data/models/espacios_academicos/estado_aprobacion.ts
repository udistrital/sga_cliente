export class EstadoAprobacion {
    readonly _id: string;
    nombre: string;
    descripcion: string;
    codigo_abreviacion: string;
    activo: boolean = true;
    readonly fecha_creacion: Date;
    fecha_modificacion: Date;
}

export const STD = Object.freeze({
    IN_EDIT: 'IN-EDIT',
    IN_REV: 'IN-REV',
    IS_APRV: 'IS-APRV',
    NOT_APRV: 'NOT-APRV',
})