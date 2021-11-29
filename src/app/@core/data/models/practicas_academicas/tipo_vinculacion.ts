import { TipoParametro } from "../parametro/tipo_parametro";

export class TipoVinculacion {
    Activo: boolean;
    CodigoAbreviacion: string;
    Descripcion: string;
    Id: number;
    Nombre: string;
    NumeroOrden: number;
    ParametroPadreId: TipoVinculacion;
    TipoParametroId: TipoParametro;
}
