import { Actividad } from './actividad';

export class Proceso {
    id: number;
    nombre: string;
    descripcion: string;
    periodicidad: string;
    actividades: Actividad[];
}