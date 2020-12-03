export class ConceptoPost {
    Vigencia: { 
        Id: number 
    };
    Factor: {
        Valor: {
            NumFactor: number
        },
    };
    Concepto: {
        Nombre: string,
        Activo: boolean,
        CodigoAbreviacion: string,
        TipoParametroId: {
            Id: number
        }
    };
}