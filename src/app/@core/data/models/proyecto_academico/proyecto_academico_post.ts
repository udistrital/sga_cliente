import { ProyectoAcademicoInstitucion } from './proyecto_academico_institucion';
import { RegistroCalificadoAcreditacion } from './registro_calificado_acreditacion';
import { InstitucionEnfasis } from './institucion_enfasis';
import { Titulacion } from './titulacion';

export class ProyectoAcademicoPost {
    ProyectoAcademicoInstitucion: ProyectoAcademicoInstitucion
    Registro: RegistroCalificadoAcreditacion[];
    Enfasis: InstitucionEnfasis[];
    Titulaciones: Titulacion[];


}
