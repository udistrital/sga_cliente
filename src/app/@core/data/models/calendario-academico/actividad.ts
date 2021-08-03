export class Actividad {
    Nombre: string;
    Descripcion: string;
    FechaInicio: string;
    FechaFin: string;
    Activo: boolean;
    responsables: any[];
    TipoEventoId: {Id: number}; // id del proceso
    actividadId: number;
    EventoPadreId: {Id: number, FechaInicio: string, FechaFin: string}
}
