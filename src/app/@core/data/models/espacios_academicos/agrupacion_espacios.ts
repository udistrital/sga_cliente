export class AgrupacionEspacios {
    readonly _id: string;
    nombre: string;
    codigo_abreviacion: string;
    descripcion: string;
    facultad_id: number;
    color_hex: string;
    activo: boolean = true;
    readonly fecha_creacion: Date;
    fecha_modificacion: Date;
}