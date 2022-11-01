import { Idioma } from './idioma';
import { ClasificacionNivelIdioma } from './clasificacion_idioma';
import { NivelIdioma } from './nivel_idioma';

export class InfoIdioma {
  Id: number;
  TercerosId: number;
  IdiomaId: Idioma;
  Nativo: boolean;
  SeleccionExamen: boolean;
  NivelEscribeId: NivelIdioma;
  NivelEscuchaId: NivelIdioma;
  NivelHablaId: NivelIdioma;
  NivelLeeId: NivelIdioma;
  NivelId: ClasificacionNivelIdioma;
  Activo: boolean;
}
