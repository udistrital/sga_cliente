import { TipoIdentificacion } from './tipo_identificacion';
import { Genero } from './genero';

export class InfoPersona {
  PrimerNombre: string;
  SegundoNombre: string;
  PrimerApellido: string;
  SegundoApellido: string;
  TipoIdentificacion: TipoIdentificacion;
  NumeroIdentificacion: string;
  FechaNacimiento: string;
  FechaExpedicion: string;
  Genero: Genero;
  Usuario: string;  
  Id: number;
  Telefono: Number;
}
