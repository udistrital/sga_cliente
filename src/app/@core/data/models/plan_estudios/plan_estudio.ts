import { EstadoAprobacion } from "./estado_aprobacion";

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
    EstadoAprobacionId: EstadoAprobacion;
    readonly FechaCreacion: Date;
    readonly FechaModificacion: Date;
}
