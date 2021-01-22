import { TipoProyecto } from '../investigacion/tipo_proyecto';
import { Inscripcion } from './inscripcion';

export class PropuestaPost {
  Id: number;
  Activo: boolean;
  DocumentoId: number;
  GrupoInvestigacionId: number;
  InscripcionId: Inscripcion;
  LineaInvestigacionId: number;
  Nombre: string;
  Resumen: string;
  TipoProyectoId: TipoProyecto;  
}
