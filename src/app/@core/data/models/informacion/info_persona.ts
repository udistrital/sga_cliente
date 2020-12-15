import { TipoIdentificacion } from './tipo_identificacion';
import { EstadoCivil } from './estado_civil';
import { Genero } from './genero';

export class InfoPersona {
  PrimerNombre: string;
  SegundoNombre: string;
  PrimerApellido: string;
  SegundoApellido: string;
  TipoIdentificacion: TipoIdentificacion;
  NumeroIdentificacion: string;
  FechaNacimiento: Date;
  FechaExpedicion: Date;
  EstadoCivil: EstadoCivil;
  Genero: Genero;
  Usuario: string;  
  Id: number;
}
