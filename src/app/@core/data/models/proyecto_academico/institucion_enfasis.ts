import { ProyectoAcademicoInstitucion } from './proyecto_academico_institucion';
import {Enfasis} from './enfasis'


export class InstitucionEnfasis {
    Id: number;
    Activo: boolean;
    ProyectoAcademicoInstitucionId: ProyectoAcademicoInstitucion;
    EnfasisId: Enfasis;
}
