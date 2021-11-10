import { TipoPoblacion } from './tipo_poblacion';
import { TipoDiscapacidad } from './tipo_discapacidad';
import { GrupoSanguineo } from './grupo_sanguineo';
import { Rh } from './rh_tercero';
import { Lugar } from './lugar';

export class InfoCaracteristicaGet {
  GrupoSanguineo: GrupoSanguineo;
  Rh: Rh;
  TipoPoblacion: TipoPoblacion;
  TipoDiscapacidad: Array<TipoDiscapacidad>;
  Lugar: {
    Id: number;
    Lugar: {
      CIUDAD: Lugar;
      DEPARTAMENTO: Lugar;
      LOCALIDAD: Lugar;
      PAIS: Lugar;
    };
    TipoRelacionUbicacionEnte: {
      Id: number;
    };
  };
  Ente: number;
  Tercero: number;
  IdDocumentoDiscapacidad: number;
  IdDocumentoPoblacion: number;
}
