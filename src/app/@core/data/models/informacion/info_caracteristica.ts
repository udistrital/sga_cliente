import { TipoPoblacion } from './tipo_poblacion';
import { TipoDiscapacidad } from './tipo_discapacidad';
import { Lugar } from './lugar';
import { GrupoSanguineo } from './grupo_sanguineo';
import { Rh } from './rh_tercero';

export class InfoCaracteristica {
  GrupoSanguineo: GrupoSanguineo;
  Rh: Rh;
  TipoPoblacion: Array<TipoPoblacion>;
  TipoDiscapacidad: Array<TipoDiscapacidad>;
  IdLugarEnte: number;
  Lugar: Lugar;
  PaisNacimiento: Lugar;
  DepartamentoNacimiento: Lugar;
  TipoRelacionUbicacionEnte: number;
  Ente: number;
  Tercero: number;
}
