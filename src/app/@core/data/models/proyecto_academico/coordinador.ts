
import { ProyectoId } from './proyecto_id';


export class Coordinador {
    PersonaId: number;
    DependenciaId: number;
    RolId: number;
    Activo: boolean;
    FechaInicio: string;
    FechaFinalizacion: string;
    ProyectoAcademicoInstitucionId: ProyectoId;

}
