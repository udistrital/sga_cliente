import { TipoVinculacion } from './tipo_vinculacion';

export class Docente {
  Id: number;
  Nombre: string;
  TipoVinculacionId: TipoVinculacion;
  Correo: string;
  CorreoInstitucional: string;
  Celular: string;
  Telefono: string;
}
