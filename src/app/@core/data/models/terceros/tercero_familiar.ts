import { TipoParentesco } from './tipo_parentesco';
import { Tercero } from './tercero';

export class TerceroFamiliar {
  Id: number;
  TerceroId: Tercero;
  TerceroFamiliarId: Tercero;
  TipoParentescoId: TipoParentesco;
  CodigoAbreviacion: string;
}

export class TrPostInformacionFamiliar {
  Tercero_Familiar: Tercero;
  Familiares: TerceroFamiliar[];
}
