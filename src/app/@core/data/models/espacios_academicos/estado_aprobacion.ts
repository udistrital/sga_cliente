export class EstadoAprobacion {
    readonly _id: string;
    nombre: string;
    descripcion: string;
    codigo_abreviacion: string;
    activo: boolean = true;
    readonly fecha_creacion: Date;
    fecha_modificacion: Date;
}