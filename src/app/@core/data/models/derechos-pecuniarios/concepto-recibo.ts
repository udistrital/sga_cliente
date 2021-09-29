import { EstadoInscripcion } from '../inscripcion/estado_inscripcion';

export class ReciboDerecho {
  Id: number;
  PersonaId: any;
  ConceptoId: any;
  ReciboDerecho: number;
  PeriodoId: any;
  EstadoInscripcionId: EstadoInscripcion;
  Activo: boolean;
}
