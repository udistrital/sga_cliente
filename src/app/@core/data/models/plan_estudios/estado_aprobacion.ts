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
    IN_EDIT: 'ED',
    IN_REV: 'REV',
    IS_APRV: 'APRO',
    WITH_OB: 'OB',
    NOT_APRV: 'NOT-APRV',
})