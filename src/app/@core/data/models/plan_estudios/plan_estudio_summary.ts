export class PlanEstudioSummary {
    Nombre: string;
    Facultad: string;
    Planes?: PlanSummary[];
    Escuelas?: any;
}

export class PlanSummary {
    Orden: number;
    Nombre: string;
    Resolucion: string;
    Creditos: number;
    Snies: string;
    PlanEstudio: string;
    InfoPeriodos: InfoPeriodo[];
    Resumen?: Resumen;
}

export class InfoPeriodo {
    Orden: number;
    Espacios: EspacioSummary[];
    TotalCreditos?: number;
}

export class EspacioSummary {
    Codigo: string;
    Nombre: string;
    Creditos: number;
    Prerequisitos: string[];
    HTD: number;
    HTC: number;
    HTA: number;
    Clasificacion: string;
    Escuela: string;
    EscuelaColor?: string;
    EscuelaColorFuente?: string;
}

export class Resumen {
    OB?: number;
    OC?: number;
    EI?: number;
    EE?: number;
}