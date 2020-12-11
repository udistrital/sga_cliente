export class ConceptoPut {
    Vigencia: { 
        Id: number,
    };
    Factor: {
        Valor: {
            NumFactor: number,
        },
        Id: number,
    };
    Concepto: {
        Id: number,
        Nombre: string,
        Activo: boolean,
        CodigoAbreviacion: string,
        TipoParametroId: {
            Id: number,
        }
    };
}