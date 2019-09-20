import { ProyectoAcademicoInstitucion } from './proyecto_academico_institucion';
import { TipoRegistro } from './tipo_registro';

export class RegistroCalificadoAcreditacion {
    Id: number;
    NumeroActoAdministrativo: number;
    AnoActoAdministrativoId: string;
    FechaCreacionActoAdministrativo: Date;
    VigenciaActoAdministrativo: string;
    VencimientoActoAdministrativo: Date;
    EnlaceActo: string;
    Activo: boolean;
    ProyectoAcademicoInstitucionId: ProyectoAcademicoInstitucion;
    TipoRegistroId: TipoRegistro;

}
