import { EstadoAprobacion } from "./estado_aprobacion";

export class PlanEstudio {
    Id: number;
    Nombre: string;
    NumeroResolucion: number;
    NumeroSemestres: number;
    Observacion: string;
    PlanEstudioPadreId: any;
    ProyectoAcademicoId: number;
    ResumenPlanEstudios: string;
    SoporteDocumental: string;
    TotalCreditos: number;
    Activo: boolean;
    AnoResolucion: number;
    Codigo: string;
    CodigoAbreaviacion: string;
    EspaciosSemestreDistribucion: string;
    EstadoAprobacionId: EstadoAprobacion;
}
