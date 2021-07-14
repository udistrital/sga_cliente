import { ProyectoId } from "./proyecto_id";

export class Coordinador {
  TerceroId: number;
  DependenciaId: number;
  ResolucionAsignacionId: number;
  Activo: boolean;
  FechaInicio: string;
  ProyectoAcademicoInstitucionId: ProyectoId;
}
