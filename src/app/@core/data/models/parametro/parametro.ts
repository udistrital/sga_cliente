import { TipoParametro } from "./tipo_parametro";

export class Parametro {
    Id: number;
    Nombre: string;
    Descripcion: string;
    CodigoAbreviacion: string;
    Activo: boolean;
    NumeroOrden: number;
    TipoParametroId: TipoParametro;
  }
