export class Criterio {
    Id: number;
    Nombre: string;
    Descripcion: string;
    CodigoAbreviacion: string;
    Activo: boolean;
    NumeroOrden: number;
    FechaCreacion: Date;
    FechaModificacion: Date;
    RequisitoPadreId: { Id: number };
    Subcriterios: Criterio[];
}