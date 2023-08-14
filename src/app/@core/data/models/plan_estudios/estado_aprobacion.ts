export class EstadoAprobacion {
    readonly Id: number;
    Nombre: string;
    Descripcion: string;
    CodigoAbreviacion: string;
    Activo: boolean = true;
    readonly FechaCreacion: Date;
    readonly FechaModificacion: Date;
}

export const STD = Object.freeze({
    IN_EDIT: 'IN-EDIT',
    IN_REV: 'IN-REV',
    IS_APRV: 'IS-APRV',
    NOT_APRV: 'NOT-APRV',
})