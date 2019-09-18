import { ProyectoAcademicoInstitucion } from './proyecto_academico_institucion';
import { TipoTitulacion } from './tipo_titulacion';

export class Titulacion {
    Id: number;
    Nombre: string;
    Descripcion: string;
    CodigoaAbreviacion: string;
    Activo: boolean;
    NumeroOrden: number;
    TipoTitulacionId: TipoTitulacion;
    ProyectoAcademicoInstitucionId: ProyectoAcademicoInstitucion;
}
