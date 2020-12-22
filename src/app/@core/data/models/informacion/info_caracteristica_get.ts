import { GrupoEtnico } from './grupo_etnico';
import { TipoDiscapacidad } from './tipo_discapacidad';
import { GrupoSanguineo } from './grupo_sanguineo';
import { Rh } from './rh_tercero';
import { Lugar } from './lugar';

export class InfoCaracteristicaGet {
  GrupoSanguineo: GrupoSanguineo;
  Rh: Rh;
  GrupoEtnico: GrupoEtnico;
  TipoDiscapacidad: Array<TipoDiscapacidad>;
  Lugar: {
    Id: number;
    Lugar: {
      CIUDAD: Lugar;
      DEPARTAMENTO: Lugar;
      PAIS: Lugar;
    };
    TipoRelacionUbicacionEnte: {
      Id: number;
    };
  };
  Ente: number;
  Tercero: number;
}
