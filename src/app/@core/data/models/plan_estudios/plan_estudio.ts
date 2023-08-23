import { EstadoAprobacion } from "./estado_aprobacion";

// estructura de cada espacio académico de la lista de
// espacios académicos de cada semestre
export class EspacioEspaciosSemestreDistribucion {
    Id: number;
    OrdenTabla: number;
    EspaciosRequeridos: Object;
}

export class PlanEstudio {
    readonly Id: number;
    Nombre: string;
    NumeroResolucion: number;
    NumeroSemestres: number;
    Observacion: string = "";
    PlanEstudioPadreId: any = null;
    ProyectoAcademicoId: number;
    ResumenPlanEstudios: string = "";
    SoporteDocumental: string = "";
    TotalCreditos: number;
    Activo: boolean = true;
    AnoResolucion: number;
    Codigo: string;
    CodigoAbreaviacion: string;
    EspaciosSemestreDistribucion: string = "";
    EsPlanEstudioPadre: boolean;
    EstadoAprobacionId: EstadoAprobacion;
    readonly FechaCreacion: Date;
    readonly FechaModificacion: Date;
}

export class PlanCiclosOrdenado {
    PlanEstudioId: PlanEstudio;
    OrdenPlan: string = "";
    Activo: boolean = true;
}