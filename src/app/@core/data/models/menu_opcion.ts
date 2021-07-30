import { Aplicacion } from './aplicacion';

export class OpcionTipoOpcion {
  Id: number;
  Nombre: string;
}

export class MenuOpcion {
  Id: number;
  Nombre: string;
  Descripcion: string;
  Url: string;
  Layout: string;
  Aplicacion: Array<Aplicacion>;
  TipoOpcion: OpcionTipoOpcion;
}
