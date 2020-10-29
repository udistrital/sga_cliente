import { Actividad } from './actividad';

export class Proceso {
    nombre: string;
    descripcion: string;
    periodicidad: string;
    actividades: Actividad[];
}